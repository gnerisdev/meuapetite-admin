import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import { DeleteIcon } from 'components/icons';

const Gallery = (props) => {
  if (!props.data) return;

  return (
    <ImageList sx={{ mt: 0.4, display: 'flex', flexWrap: 'wrap', gap: '2rem !important' }}>
      {props.data?.map((item, index) => (
        <ImageListItem
          key={`image-${index}`}
          sx={{ height: 200, borderRadius: 4, width: 'fit-content;' }}
        >
          <img
            style={{ borderRadius: 5, width: 200, height: 200, objectFit: 'contain', border: '1px solid #000' }}
            src={item.src || item.url}
            alt={item.title}
            loading="lazy"
          />
          <ImageListItemBar
            title="Remover"
            onClick={() => props.closeImage(index)}
            sx={{ cursor: "pointer" }}
            actionIcon={
              <IconButton
                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                aria-label={`info about ${item.name}`}
                data-id={item.name}
              >
                <DeleteIcon />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default Gallery;
