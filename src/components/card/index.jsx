import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

const CardTable = ({text, title, image}) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia component="img" height="140" image={image} alt="green iguana" />
        <CardContent>
          <Typography variant="h6" component="div">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{text}</Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">Visualizar</Button>
        <Button size="small" color="info">Editar</Button>
        <Button size="small" color="error">Excluir</Button>
      </CardActions>
    </Card>
  );
}

export default CardTable;