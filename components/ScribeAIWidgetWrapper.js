"use client";

import dynamic from 'next/dynamic';

const ScribeAIWidget = dynamic(
  () => import('./ScribeAIWidget'),
  {
    ssr: false,
    loading: () => null
  }
);

export default ScribeAIWidget;