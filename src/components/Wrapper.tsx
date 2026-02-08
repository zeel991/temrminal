'use client';

import type {ReactNode} from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

const Wrapper = ({title, children}: Props) => {
  return (
    <>
      <h2 className="mt-6 text-2xl text-black">{title}</h2>
      {children}
    </>
  );
};

export default Wrapper;