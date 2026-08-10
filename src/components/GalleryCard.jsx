import React, { memo } from "react";
import styled from "styled-components";
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";

const GalleryCard = memo(({
  img,
  index,
  isFavorite,
  isSaved,
  rating,
  qualification,
  onOpen,
  onToggleFavorite,
  onToggleSave,
}) => {
  const imageId = img?.id || img?.image_id;

  return (
    <CardWrapper
      className="card border-0 rounded-3 overflow-hidden cursor-pointer custom-card-neon"
      onClick={() => onOpen(imageId, index)}
    >
      <ImageContainer className="position-relative overflow-hidden d-flex align-items-center justify-content-center">
        <CardImage
          src={img.url || img}
          alt=""
          loading="lazy"
          className="card-img-neon position-absolute top-0 start-0 w-100 h-100"
        />
        <RatingOverlay className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-between align-items-center px-2 py-1">
          <div className="d-flex gap-2">
            <FavoriteIcon
              className="d-flex align-items-center justify-content-center rounded-circle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite && onToggleFavorite(imageId, index);
              }}
            >
              {isFavorite ? (
                <FaHeart style={{ color: "#ff4d6d", fontSize: "1.2rem" }} />
              ) : (
                <FaRegHeart style={{ color: "#fff", fontSize: "1.2rem" }} />
              )}
            </FavoriteIcon>
            {onToggleSave && (
              <SaveIcon
                className="d-flex align-items-center justify-content-center rounded-circle"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(imageId, index);
                }}
              >
                {isSaved ? (
                  <FaBookmark style={{ color: "#00f2fe", fontSize: "1.1rem" }} />
                ) : (
                  <FaRegBookmark style={{ color: "#fff", fontSize: "1.1rem" }} />
                )}
              </SaveIcon>
            )}
          </div>
          <div className="d-flex align-items-center gap-1 text-white small">
            {[1, 2, 3, 4, 5].map((i) =>
              i <= Math.round(qualification?.qualification || 0) ? (
                <FaStar key={i} style={{ color: "#ffc107", fontSize: "0.9rem" }} />
              ) : (
                <FaRegStar key={i} style={{ color: "#ffc107", fontSize: "0.9rem" }} />
              )
            )}
          </div>
        </RatingOverlay>
      </ImageContainer>
    </CardWrapper>
  );
});

GalleryCard.displayName = "GalleryCard";

export default GalleryCard;

const CardWrapper = styled.div`
  transition: all 0.3s ease-in-out;
  background: rgba(255, 255, 255, 0.04) !important;
  break-inside: avoid;

  &:hover {
    box-shadow: 0 0 25px rgba(0, 242, 254, 0.25) !important;
    transform: translateY(-3px);
  }
`;

const ImageContainer = styled.div`
  padding-bottom: 125%;

  @media (max-width: 768px) {
    padding-bottom: 0;
    height: auto;
  }
`;

const CardImage = styled.img`
  transition: transform 0.4s ease;
  object-fit: cover !important;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    position: static !important;
    height: auto;
    display: block;
  }

  ${CardWrapper}:hover & {
    transform: scale(1.03);
  }
`;

const RatingOverlay = styled.div`
  background: rgba(0, 0, 0, 0.75);
  z-index: 2;
  min-height: 36px;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    position: relative;
  }
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

const SaveIcon = styled.div`
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
