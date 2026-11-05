
import React from "react";
import { Routes, Route } from "react-router-dom";

// 공통 레이아웃
import { Layout } from "../pages/layout/Layout";

// 메인 페이지
import { Home } from "../pages/home/Home";

// 카테고리 페이지
import { Entertainment } from "../pages/category/Entertainment";
import { EntertainmentAll } from "../pages/category/EntertainmentAll";
import { CategoryAll } from "../pages/category/CategoryAll";
import { CollectionAll } from "../pages/category/CollectionAll";
import { Drama } from "../pages/category/Drama";
import { Movie } from "../pages/category/Movie";
import { Currentaffairs } from "../pages/category/Currentaffairs";
import { Animation } from "../pages/category/Animation";
import { Global } from "../pages/category/Global";
import { Live } from "../pages/live/Live";
import { Category } from "../pages/category/Category";

// 콘텐츠 상세 페이지
import { ProgramDetail } from "../pages/contents/ProgramDetail";
import { MovieDetail } from "../pages/contents/MovieDetail";
import { EntertainmentDetail } from "../pages/contents/EntertainmentDetail";
import { DramaDetail } from "../pages/contents/DramaDetail";
import { CurrentaffairsDetail } from "../pages/contents/CurrentaffairsDetail";
import { AnimationDetail } from "../pages/contents/AnimationDetail";
import { GlobalDetail } from "../pages/contents/GlobalDetail";

// 라이브 페이지
import { LiveChannel } from "../pages/live/LiveChannel";
import { Schedule } from "../pages/live/Schedule";

// 레트로브 페이지
import { RetroV } from "../pages/retrov/RetroV";
import { RetrovDetail } from "../pages/retrov/RetrovDetail";

// 이벤트 페이지
import { Event } from "../pages/event/Event";
import { EventDetail } from "../pages/event/EventDetail";

// 검색 및 숏폼 페이지
import { Search } from "../pages/search/Search";
import { Shorts } from "../pages/shorts/Shorts";

// 회사소개 및 고객센터
import { Company } from "../pages/customer/Company";
import { Service } from "../pages/customer/Service";
import { Notice } from "../pages/support/Notice";
import { NoticeView } from "../pages/support/NoticeView";
import Support from "../pages/support/Support";
import Inquiry from "../pages/support/Inquiry";
import InquiryWrite from "../pages/support/InquiryWrite";
import { Terms } from "../pages/support/Terms";

// 회원 페이지
import Login from "../pages/member/Login";
import { Member } from "../pages/member/Member";
import { ProfileSelect } from "../pages/member/ProfileSelect";
import { ProfileEdit } from "../pages/member/ProfileEdit";
import { MyPage } from "../pages/member/MyPage";

export const AppRouter = () => {
  return (
    <Routes>
      {/* 공통 Layout을 사용하지 않는 페이지 */}
      <Route
        path="/profileselect"
        element={<ProfileSelect />}
      />

      <Route
        path="/profileedit"
        element={<ProfileEdit />}
      />

      {/* 1:1 문의 작성 - 공통 Layout 미적용 */}
      <Route
        path="/inquiry/write"
        element={<InquiryWrite />}
      />

      {/* 공통 Layout 사용 */}
      <Route path="/" element={<Layout />}>
        {/* 메인 */}
        <Route index element={<Home />} />

        {/* 웨이브 콘텐츠 */}
        <Route
          path="/entertainment"
          element={<Entertainment />}
        />
        <Route path="/entertainment/all" element={<EntertainmentAll />} />
        {/* 6개 카테고리 전체보기 (예능은 위의 기존 주소를 사용) */}
        <Route path="/:category/all" element={<CategoryAll />} />
        {/* 메인 섹션별 더보기: 동일한 섹션의 목록을 보여줍니다. */}
        <Route path="/collection/:sectionId" element={<CollectionAll />} />
        <Route path="/drama" element={<Drama />} />
        <Route path="/movie" element={<Movie />} />
        <Route
          path="/currentaffairs"
          element={<Currentaffairs />}
        />
        <Route path="/animation" element={<Animation />} />
        <Route path="/global" element={<Global />} />
        <Route path="/category" element={<Category />} />

        {/* 콘텐츠 상세 */}
        <Route
          path="/programdetail/:programId"
          element={<ProgramDetail />}
        />
        <Route
          path="/moviedetail/:movieId"
          element={<MovieDetail />}
        />
        <Route
          path="/entertainmentdetail/:programId"
          element={<EntertainmentDetail />}
        />
        <Route
          path="/dramadetail/:programId"
          element={<DramaDetail />}
        />
        <Route
          path="/currentaffairsdetail/:programId"
          element={<CurrentaffairsDetail />}
        />
        <Route
          path="/animationdetail/:programId"
          element={<AnimationDetail />}
        />
        <Route
          path="/globaldetail/:programId"
          element={<GlobalDetail />}
        />

        {/* LIVE */}
        <Route path="/live" element={<Live />} />
        <Route
          path="/livechannel"
          element={<LiveChannel />}
        />
        <Route path="/schedule" element={<Schedule />} />

        {/* 레트로브 */}
        <Route path="/retrov" element={<RetroV />} />
        <Route
          path="/retrov/:programId"
          element={<RetrovDetail />}
        />

        {/* 이벤트 */}
        <Route path="/event" element={<Event />} />
        <Route
          path="/eventdetail"
          element={<EventDetail />}
        />

        {/* 검색 및 숏폼 */}
        <Route path="/search" element={<Search />} />
        <Route path="/shorts" element={<Shorts />} />

        {/* 회사소개 및 고객센터 */}
        <Route path="/company" element={<Company />} />
        <Route path="/service" element={<Service />} />

        <Route path="/notice" element={<Notice />} />

        {/* 기존 noticeview 주소 호환 */}
        <Route
          path="/noticeview"
          element={<NoticeView />}
        />

        {/* develop 브랜치의 공지 상세 주소 */}
        <Route
          path="/notice/:id"
          element={<NoticeView />}
        />

        <Route path="/support" element={<Support />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/terms" element={<Terms />} />

        {/* 회원 */}
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
