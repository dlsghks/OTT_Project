import { Routes, Route } from "react-router-dom";

// 공통 레이아웃 및 홈
import { Layout } from "../pages/layout/Layout";
import { Home } from "../pages/home/Home";

// 카테고리
import { Entertainment } from "../pages/category/Entertainment";
import { EntertainmentAll } from "../pages/category/EntertainmentAll";
import { CategoryAll } from "../pages/category/CategoryAll";
import { CollectionAll } from "../pages/category/CollectionAll";
import { Drama } from "../pages/category/Drama";
import { Movie } from "../pages/category/Movie";
import { Currentaffairs } from "../pages/category/Currentaffairs";
import { Animation } from "../pages/category/Animation";
import { Global } from "../pages/category/Global";
import { Category } from "../pages/category/Category";

// 콘텐츠 상세
import { ProgramDetail } from "../pages/contents/ProgramDetail";
import { MovieDetail } from "../pages/contents/MovieDetail";
import { EntertainmentDetail } from "../pages/contents/EntertainmentDetail";
import { DramaDetail } from "../pages/contents/DramaDetail";
import { CurrentaffairsDetail } from "../pages/contents/CurrentaffairsDetail";
import { AnimationDetail } from "../pages/contents/AnimationDetail";
import { GlobalDetail } from "../pages/contents/GlobalDetail";
import { HomeContentDetail } from '../pages/homeContent/HomeContentDetail';

// 라이브
import { Live } from "../pages/live/Live";
import { LiveChannel } from "../pages/live/LiveChannel";
import { Schedule } from "../pages/live/Schedule";

// 레트로브
import { RetroV } from "../pages/retrov/RetroV";
import { RetrovDetail } from "../pages/retrov/RetrovDetail";

// 이벤트
import { Event } from "../pages/event/Event";
import { EventDetail } from "../pages/event/EventDetail";

// 스페셜 및 뉴스
import { SpecialPage } from "../pages/special/SpecialPage";
import { TmdbOpen } from "../pages/special/TmdbOpen";
import { NewsClipList } from "../pages/special/NewsClipList";
import { NewsClip } from "../pages/special/NewsClip";
import { GolfClip } from "../pages/special/GolfClip";
import { GolfProgram } from "../pages/special/GolfProgram";

// 검색 및 숏폼
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

// 회원
import Login from "../pages/member/Login";
import { Member } from "../pages/member/Member";
import { ProfileSelect } from "../pages/member/ProfileSelect";
import { ProfileEdit } from "../pages/member/ProfileEdit";
import { MyPage } from "../pages/member/MyPage";
import { Settings } from "../pages/member/Settings";
import InquiryDetail from "../pages/support/InquiryDetail";
import Voucher from "../pages/member/Voucher";

export const AppRouter = () => {
  return (
    <Routes>
      {/* 공통 레이아웃 미사용 */}
      <Route path="/profileselect" element={<ProfileSelect />} />
      <Route path="/profileedit" element={<ProfileEdit />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/inquiry/write" element={<InquiryWrite />} />

      {/* 공통 레이아웃 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        {/* 카테고리 및 전체보기 */}
        <Route path="/entertainment" element={<Entertainment />} />
        <Route path="/entertainment/all" element={<EntertainmentAll />} />
        <Route path="/:category/all" element={<CategoryAll />} />
        <Route path="/collection/:sectionId" element={<CollectionAll />} />

        <Route path="/drama" element={<Drama />} />
        <Route path="/movie" element={<Movie />} />
        <Route path="/currentaffairs" element={<Currentaffairs />} />
        <Route path="/animation" element={<Animation />} />
        <Route path="/global" element={<Global />} />
        <Route path="/category" element={<Category />} />

        {/* 콘텐츠 상세 */}
        <Route
          path="/programdetail/:programId"
          element={<ProgramDetail />}
        />
        <Route path="/moviedetail/:movieId" element={<MovieDetail />} />
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
        <Route
          path="/home-content/:sectionId/:contentId"
          element={<HomeContentDetail />}
        />

        {/* 라이브 */}
        <Route path="/live" element={<Live />} />
        <Route path="/livechannel" element={<LiveChannel />} />
        <Route path="/schedule" element={<Schedule />} />

        {/* 레트로브 */}
        <Route path="/retrov" element={<RetroV />} />
        <Route path="/retrov/:programId" element={<RetrovDetail />} />

        {/* 이벤트 */}
        <Route path="/event" element={<Event />} />
        <Route path="/eventdetail/:eventId" element={<EventDetail />} />

        {/* 스페셜 및 뉴스 */}
        <Route path="/special/:slug" element={<SpecialPage />} />
        <Route path="/open" element={<TmdbOpen />} />
        <Route path="/special/news/:tab" element={<NewsClipList />} />
        <Route path="/news/clip/:clipId" element={<NewsClip />} />

        {/* 골프: 클립 재생 · 프로그램 상세 */}
        <Route path="/golf/clip/:clipId" element={<GolfClip />} />
        <Route path="/golf/program/:programId" element={<GolfProgram />} />

        {/* 검색 및 숏폼 */}
        <Route path="/search" element={<Search />} />
        <Route path="/shorts" element={<Shorts />} />

        {/* 회사소개 및 고객센터 */}
        <Route path="/company" element={<Company />} />
        <Route path="/service" element={<Service />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/noticeview" element={<NoticeView />} />
        <Route path="/notice/:id" element={<NoticeView />} />
        <Route path="/support" element={<Support />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/inquiry/:id" element={<InquiryDetail />} />
        <Route path="/terms" element={<Terms />} />

        {/* 이용원 구매 */}
        <Route path="/voucher" element={<Voucher />} />

        {/* 회원 */}
        <Route path="/login" element={<Login />} />
        <Route path="/member" element={<Member />} />
        <Route path="/mypage" element={<MyPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;