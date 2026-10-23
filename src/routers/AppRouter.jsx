
import React from "react";
import { Routes, Route } from "react-router-dom";

// 공통 레이아웃
import {Layout} from "../pages/Layout";

// 기존 페이지
import {Home} from "../pages/Home";
import {Entertainment} from "../pages/category/Entertainment";
import {Drama} from "../pages/category/Drama";
import {Movie} from "../pages/category/Movie";
import {Currentaffairs} from "../pages/category/Currentaffairs";
import {Animation} from "../pages/category/Animation";
import {Global} from "../pages/category/Global";
import {Live} from "../pages/category/Live";
import {RetroV} from "../pages/RetroV";
import {ProgramDetail} from "../pages/contents/ProgramDetail";

// 추가 페이지
import {Category} from "../pages/category/Category";
import {Event} from "../pages/event/Event";
import {EventDetail} from "../pages/event/EventDetail";
import {LiveChannel} from "../pages/LiveChannel";
import {Login} from "../pages/member/Login";
import {Member} from "../pages/member/Member";
import {Notice} from "../pages/notice/Notice";
import {NoticeView} from "../pages/notice/NoticeView";
import {ProfileSelect} from "../pages/member/ProfileSelect";
import {Schedule} from "../pages/Schedule";
import {Search} from "../pages/Search";
import {Shorts} from "../pages/Shorts";
import { RetrovDetail } from "../pages/RetrovDetail";

export const AppRouter = () => {
  return (

      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 메인 */}
          <Route index element={<Home />} />

          {/* 웨이브 콘텐츠 */}
          <Route path="/entertainment" element={<Entertainment />} />
          <Route path="/drama" element={<Drama />} />
          <Route path="/movie" element={<Movie />} />
          <Route path="/currentaffairs" element={<Currentaffairs />} />
          <Route path="/animation" element={<Animation />} />
          <Route path="/global" element={<Global />} />
          <Route path="/category" element={<Category />} />
          <Route path="/programdetail" element={<ProgramDetail />} />

          {/* LIVE */}
          <Route path="/live" element={<Live />} />
          <Route path="/livechannel" element={<LiveChannel />} />
          <Route path="/schedule" element={<Schedule />} />

          {/* 레트로브 */}
          <Route path="/retrov" element={<RetroV />} />
          <Route path="/retrov/:programId" element={<RetrovDetail/>}/>

          {/* 이벤트 */}
          <Route path="/event" element={<Event />} />
          <Route path="/eventdetail" element={<EventDetail />} />

          {/* 검색 및 숏폼 */}
          <Route path="/search" element={<Search />} />
          <Route path="/shorts" element={<Shorts />} />

          {/* 공지사항 */}
          <Route path="/notice" element={<Notice />} />
          <Route path="/noticeview" element={<NoticeView />} />

          {/* 회원 */}
          <Route path="/login" element={<Login />} />
          <Route path="/member" element={<Member />} />
          <Route path="/profileselect" element={<ProfileSelect />} />
        </Route>
      </Routes>

  );
};

export default AppRouter;
