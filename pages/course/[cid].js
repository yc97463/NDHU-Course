import * as React from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function CourseDetailPage({ children }) {
  let { cid } = useRouter().query;
  const courseInfo = {
    cid: cid,
    year: "111",
    semester: "2",

    subjid: "AM__3120AA",
    subjname: "代數(二)AA",
    score: "3",
    subjmust: "學程",
    subjeng: "否",
    subjename: "Algebra (II)",
    subjlevel: "學三",
    depname: "應用數學系",
    _teacher: ["官彥良"],
    _subjtime: ["一5", "一6", "三4"],
  };

  return (
    <div>
      <Head>
        <title>
          {courseInfo.year +
            courseInfo.semester +
            courseInfo.subjname +
            " - " +
            courseInfo.depname}
        </title>
        <meta
          property="og:title"
          content={`
            東華東課 - ${courseInfo.year + courseInfo.semester} ${
            courseInfo.depname + courseInfo.subjname
          }
            `}
        />
        <meta
          name="description"
          content={`
            ${courseInfo.year} 學年度 第 ${courseInfo.semester} 學期，${courseInfo.depname}「${courseInfo.subjname}」的課程資訊。`}
        />
        <meta property="og:image" content="https://i.imgur.com/d8khn37.png" />
      </Head>
      <div className="w-full shadow-md py-3">
        <div className="w-10/12 lg:w-3/4 mx-auto">
          <div className="text-lg font-medium">
            <Link href="/">東華東課</Link>
          </div>
        </div>
      </div>

      <div className="w-10/12 my-10 lg:w-3/4 mx-auto">
        <div>
          <div>
            <h1 className="content-center flex items-stretch">
              <span className="rounded-full bg-cyan-500/[.6] font-bold text-sm self-center mr-1.5 px-3.5 py-1 ">
                {courseInfo.year + "-" + courseInfo.semester}
              </span>
              <span className="text-2xl font-semibold">
                {" "}
                {courseInfo.subjname}
              </span>
            </h1>
            <p>{courseInfo.depname}</p>
          </div>
          <div className="my-2">
            <Link
              href={`https://sys.ndhu.edu.tw/AA/CLASS/TeacherSubj/prt_tplan.aspx?no=${courseInfo.cid}`}
              target="_blank"
            >
              <button className="py-2 px-3 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-md shadow focus:outline-none">
                教學計畫表
              </button>
            </Link>
            <CopyToClipboard
              text={"https://course.ndhu.dstw.dev/course/" + courseInfo.cid}
              onCopy={() => {
                alert("複製完成！");
              }}
            >
              <button className="py-2 px-3 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-md shadow focus:outline-none mx-2">
                複製連結
              </button>
            </CopyToClipboard>
          </div>
          <div>
            <div class="grid grid-cols-1 md:grid-cols-3 md:grid-flow-row md:flex">
              <div className="w-full md:mr-1 md:w-2/6 md:flex-auto">
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    課程資訊
                  </h2>
                  <div>
                    <h6 className="text-sm text-cyan-500">科目名稱</h6>
                    {courseInfo.subjname}
                    <h6 className="text-sm text-cyan-500">科目代碼</h6>
                    {courseInfo.subjid}
                    <h6 className="text-sm text-cyan-500">開課單位</h6>
                    {courseInfo.depname}
                    <h6 className="text-sm text-cyan-500">系級</h6>
                    <span className="rounded-lg bg-cyan-500/[.6] text-xs mx-1 px-2 py-1">
                      {courseInfo.subjmust}
                    </span>
                    {courseInfo.subjlevel}
                    <h6 className="text-sm text-cyan-500">學分</h6>
                    {courseInfo.score}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    上課資訊
                  </h2>
                  <div>
                    <h6 className="text-sm text-cyan-500">授課老師</h6>
                    {courseInfo._teacher + ""}
                    <h6 className="text-sm text-cyan-500">節次</h6>
                    {courseInfo._subjtime + ""}
                    <h6 className="text-sm text-cyan-500">教室</h6>
                  </div>
                </div>
              </div>

              <div className="w-full md:mx-1 md:w-3/6 md:flex-auto">
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    課程大綱
                  </h2>
                  <div></div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    修課資訊
                  </h2>
                  <div></div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    評量方式
                  </h2>
                  <div></div>
                </div>
              </div>

              <div className="w-full md:ml-1 md:w-2/6 md:flex-auto">
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    選課統計
                  </h2>
                  <div></div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    修課評價
                  </h2>
                  <div></div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium font-semibold">
                    加簽資訊
                  </h2>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
