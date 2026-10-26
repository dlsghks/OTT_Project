import { useParams, Link } from 'react-router-dom';
import { programData } from '../../data/programData';

import { ProgramHero } from '../../components/program/ProgramHero';
import { ProgramInfo } from '../../components/program/ProgramInfo';
import { EpisodeList } from '../../components/program/EpisodeList';
import { CastList } from '../../components/program/CastList';
import { RelatedPrograms } from '../../components/program/RelatedPrograms';

import '../../styles/pages/ProgramDetail.scss';

export const ProgramDetail = () => {
    const { programId } = useParams();

    const program = programData.find(
        item => String(item.id) === programId
    );

    if (!program) {
        return (
            <div className="program-detail">
                <h2>프로그램 정보를 찾을 수 없습니다.</h2>
                <Link to="/">홈으로 돌아가기</Link>
            </div>
        );
    }

    return (
        <div className="program-detail">

            <ProgramHero program={program} />

            <ProgramInfo program={program} />

            {program.type !== 'movie' && (
                <EpisodeList episodes={program.episodes || []} />
            )}

            <CastList cast={program.cast || []} />

            <RelatedPrograms currentProgram={program} />

        </div>
    );
};