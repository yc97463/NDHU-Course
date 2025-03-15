import HomeClient from "@/components/Home/HomeClient";

interface CourseData {
  [courseId: string]: {
    course_id: string;
    course_name: string;
    // other fields from your JSON...
  };
}

export default async function Home() {
  // Fetch list of semesters
  const semesterRes = await fetch("https://yc97463.github.io/ndhu-course-crawler/semester.json", {
    next: { revalidate: 3600 }
  });

  if (!semesterRes.ok) {
    throw new Error("Failed to fetch semester data");
  }

  const semesters: string[] = await semesterRes.json();

  // Fetch course data for each semester
  const semesterData = await Promise.all(
    semesters.map(async (semester) => {
      // Filter semesters based on criteria
      if (parseInt(semester.split("-")[1]) > 2) return null;
      if (parseInt(semester.split("-")[0]) < 105) return null;

      const courseRes = await fetch(`https://yc97463.github.io/ndhu-course-crawler/${semester}/main.json`, {
        next: { revalidate: 3600 }
      });

      if (!courseRes.ok) {
        console.error(`Failed to fetch courses for semester ${semester}`);
        return null;
      }

      const coursesData: CourseData = await courseRes.json();

      // Transform the course data from object to array of CourseInfo objects
      const courses = Object.entries(coursesData).map(([courseId, courseDetails]) => ({
        id: courseId,
        name: courseDetails.course_name || courseId // Fallback to ID if name is missing
      }));

      return { semester, courses };
    })
  );

  // Filter out null values
  const filteredSemesterData = semesterData.filter(item => item !== null);

  return <HomeClient semesterData={filteredSemesterData} />;
}
