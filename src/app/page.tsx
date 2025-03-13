import HomeClient from "@/components/Home/HomeClient";

interface Course {
  [sqlId: string]: string;
}

export default async function Home() {
  // ✅ Fetch data at build-time
  const res = await fetch("https://yc97463.github.io/ndhu-course-crawler/main.json", {
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch course data");
  }

  const courses: Course = await res.json();

  return <HomeClient courses={courses} />;
}
