import React, { memo } from "react";
import styled from "styled-components";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

const GalleryCard = memo(({
  img,
  index,
  isFavorite,
  rating,
  onOpen,
  onToggleFavorite,
}) => {
  const imageId = img?.id || img?.image_id;

  return (
    <CardWrapper
      className="card border-0 rounded-3 overflow-hidden cursor-pointer custom-card-neon"
      onClick={() => onOpen(imageId, index)}
    >
      <div className="position-relative overflow-hidden d-flex align-items-center justify-content-center" style={{ paddingBottom: "125%" }}>
        <CardImage
          src={img.url || img}
          alt=""
          loading="lazy"
          className="card-img-neon position-absolute top-0 start-0 w-100 h-100"
        />
        <RatingOverlay className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-between align-items-center px-2 py-1">
          <FavoriteIcon
            className="d-flex align-items-center justify-content-center rounded-circle"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(imageId, index);
            }}
          >
            {isFavorite ? (
              <FaHeart style={{ color: "#ff4d6d", fontSize: "1.2rem" }} />
            ) : (
              <FaRegHeart style={{ color: "#fff", fontSize: "1.2rem" }} />
            )}
          </FavoriteIcon>
          <div className="d-flex align-items-center gap-1 text-white small">
            <FaStar style={{ color: "#ffc107" }} />
            <span>{rating?.stars?.toFixed(1) || "0.0"} ({rating?.count || 0})</span>
          </div>
        </RatingOverlay>
      </div>
    </CardWrapper>
  );
});

GalleryCard.displayName = "GalleryCard";

export default GalleryCard;

const CardWrapper = styled.div`
  transition: all 0.3s ease-in-out;
  background: rgba(255, 255, 255, 0.04) !important;

  &:hover {
    box-shadow: 0 0 25px rgba(0, 242, 254, 0.25) !important;
    transform: translateY(-3px);
  }
`;

const CardImage = styled.img`
  transition: transform 0.4s ease;
  object-fit: cover !important;

  ${CardWrapper}:hover & {
    transform: scale(1.03);
  }
`;

const RatingOverlay = styled.div`
  background: rgba(0, 0, 0, 0.75);
  z-index: 2;
  min-height: 36px;
  backdrop-filter: blur(4px);
`;

const FavoriteIcon = styled.div`
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  z-index: 3;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;
