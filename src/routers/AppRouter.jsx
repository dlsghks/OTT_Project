
import React from "react";
import { Routes, Route } from "react-router-dom";

// 공통 레이아웃
import { Layout } from "../pages/Layout";

// 메인 페이지
import { Home } from "../pages/home/Home";

// 카테고리 페이지
import { Entertainment } from "../pages/category/Entertainment";
import { Drama } from "../pages/category/Drama";
import { Movie } from "../pages/category/Movie";
import { Currentaffairs } from "../pages/category/Currentaffairs";
import { Animation } from "../pages/category/Animation";
import { Global } from "../pages/category/Global";
import { Live } from "../pages/category/Live";
import { Category } from "../pages/category/Category";

// 콘텐츠 상세 페이지
import { ProgramDetail } from "../pages/contents/ProgramDetail";
import { MovieDetail } from "../pages/contents/MovieDetail";

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
import { Search } from "../pages/Search";
import { Shorts } from "../pages/Shorts";

// 공지사항 페이지
import { Company } from '../pages/customer/Company';
import { Service } from '../pages/customer/Service';
import { Notice } from "../pages/notice/Notice";
import { NoticeView } from "../pages/notice/NoticeView";
import Support from "../pages/support/Support";
import Inquiry from "../pages/support/Inquiry";
import InquiryWrite from "../pages/support/InquiryWrite";
import { Terms } from "../pages/support/Terms";

// 회원 페이지
import Login from "../pages/member/Login";
import { Member } from "../pages/member/Member";
import { ProfileSelect } from "../pages/member/ProfileSelect";
import { MyPage } from "../pages/member/MyPage";


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
                <Route path="/programdetail/:programId" element={<ProgramDetail />} />
                <Route path="/moviedetail/:movieId" element={<MovieDetail />} />

                {/* LIVE */}
                <Route path="/live" element={<Live />} />
                <Route path="/livechannel" element={<LiveChannel />} />
                <Route path="/schedule" element={<Schedule />} />

                {/* 레트로브 */}
                <Route path="/retrov" element={<RetroV />} />
                <Route path="/retrov/:programId" element={<RetrovDetail />} />

                {/* 이벤트 */}
                <Route path="/event" element={<Event />} />
                <Route path="/eventdetail" element={<EventDetail />} />

                {/* 검색 및 숏폼 */}
                <Route path="/search" element={<Search />} />
                <Route path="/shorts" element={<Shorts />} />

                {/* 공지사항 */}
                <Route path="/company" element={<Company />} />
                <Route path="/service" element={<Service />} />
                <Route path="/notice" element={<Notice />} />
                <Route path="/notice/:id" element={<NoticeView />} />
                <Route path="/support" element={<Support />} />
                <Route path="/inquiry" element={<Inquiry />} />
                <Route path="/terms" element={<Terms />} />

                {/* 회원 */}
                <Route path="/login" element={<Login />} />
                <Route path="/member" element={<Member />} />
                <Route path="/profileselect" element={<ProfileSelect />} />
                <Route path="/mypage" element={<MyPage />} />



            </Route>

            {/* 1:1 문의 작성 - 공통 Layout 미적용 */}
            <Route
                path="/inquiry/write"
                element={<InquiryWrite />}
            />

        </Routes >
    );
};

export default AppRouter;
