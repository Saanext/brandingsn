'use client';

export const BackgroundAnimation = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-full bg-neural-net"></div>
      <div className="wave"></div>
      <div className="wave"></div>
      <div className="wave"></div>
    </div>
  );
};
