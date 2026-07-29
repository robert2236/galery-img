import React, { memo } from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const SkeletonCard = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  padding-bottom: 125%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(0, 242, 254, 0.1);
`;

const Shimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;

const SkeletonOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0 0 8px 8px;
`;

const SkeletonGrid = memo(({ count = 8 }) => {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 p-3">
      {Array.from({ length: count }, (_, i) => (
        <div className="col" key={`skeleton-${i}`}>
          <SkeletonCard>
            <Shimmer />
            <SkeletonOverlay />
          </SkeletonCard>
        </div>
      ))}
    </div>
  );
});

SkeletonGrid.displayName = "SkeletonGrid";

export default SkeletonGrid;
