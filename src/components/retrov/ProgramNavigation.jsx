import React from 'react';
import { Link } from 'react-router-dom';
import { getImagePath } from '../../utils/imagePath';

export default function ProgramNavigation({ programs }) {
  return (
    <nav className="circle-navigation" aria-label="프로그램 선택">
      {programs.map((program) => (
        <Link
          key={program.id}
          to={`/retrov/${program.id}`}
          className="circle-navigation__item"
        >
          <img
            src={getImagePath(program.image)}
            alt=""
          />
          <span>{program.title}</span>
        </Link>
      ))}
    </nav>
  );
}