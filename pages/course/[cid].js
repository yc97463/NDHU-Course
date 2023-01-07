import * as React from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function CourseDetailPage({ children }) {
  let { cid } = useRouter().query;
  const courseInfo = {
    cid: cid,
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
          {courseInfo.subjname} - {courseInfo.depname}
        </title>
      </Head>
      <div className="w-full shadow-md py-3">
        <div className="w-3/4 mx-auto">
          <div className="text-lg font-medium">
            <Link href="/">東華東課</Link>
          </div>
        </div>
      </div>

      <div className="w-3/4 mx-auto my-10">
        <div>
          <div>
            <h1 className="text-2xl">{courseInfo.subjname}</h1>
            <p>{courseInfo.depname}</p>
          </div>
          <div>
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
            <div class="grid grid-cols-1 md:grid-cols-3">
              <div className="md:mr-1">
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium">課程資訊</h2>
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
                  <h2 className="text-xl font-medium">選課統計</h2>
                  <div></div>
                </div>
              </div>

              <div className="md:mx-1">
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium">上課資訊</h2>
                  <div>
                    <h6 className="text-sm text-cyan-500">授課老師</h6>
                    {courseInfo._teacher + ""}
                    <h6 className="text-sm text-cyan-500">節次</h6>
                    {courseInfo._subjtime + ""}
                    <h6 className="text-sm text-cyan-500">教室</h6>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium">修課資訊</h2>
                  <div></div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium">修課評價</h2>
                  <div></div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium">加簽資訊</h2>
                  <div></div>
                </div>
              </div>
              <div className="md:ml-1">
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium">課程大綱</h2>
                  <div></div>
                </div>
                <div className="rounded-lg bg-slate-200 px-7 py-5 mt-2 shadow-md">
                  <h2 className="text-xl font-medium">評量方式</h2>
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
