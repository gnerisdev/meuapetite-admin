import React from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Typography, List, ListItem, Grid } from '@mui/material';
import { CloseIcon } from 'components/icons';
import * as S from './style';

const OrderDetailsModal = ({ modalView, modalViewClose, order }) => {
  return (
    <Dialog fullScreen open={modalView} onClose={modalViewClose}>
      <AppBar sx={{ position: 'sticky' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={modalViewClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Pedido #{order.id}
          </Typography>
        </Toolbar>
      </AppBar>

      <S.CustomPaper>
        <Typography variant="h4" align="center" style={{ marginBottom: '16px' }}>
          Detalhes do pedido #{order.id}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Informações do cliente:</Typography>
            <Typography variant="body1">
              Nome: {order.client.name} <br />
              Email: {order.client.email} <br />
              Telefone: {order.client.phoneNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            {order.deliveryType === 'delivery' ? (
              <>
                <Typography variant="h6">Endereço de entrega:</Typography>
                <Typography variant="body1">
                  {order?.address?.street} <br />
                  {order?.address?.city}, {'BA'}, {'44400432'}
                </Typography>
              </>
            ) : (
              <Typography variant="h6">**Pedido para retirada**</Typography>
            )}
          </Grid>
        </Grid>
        <Typography variant="h6" sx={{ mt: '20px', mb: '-16px' }}>Itens pedido:</Typography>
        <List>
          {order.products?.map((item, i) => (
            <S.ProductInfo key={i}>
              <div>
                <ListItem sx={{ pt: '2px', pb: '2px', display: 'flex', flexWrap: 'wrap' }}>
                  Produto:&#160;<strong>{item.productName}</strong>
                </ListItem>
                {item?.complement && <ListItem sx={{ pt: '2px', pb: '2px', display: 'flex', flexWrap: 'wrap' }}>
                  Complementos:&#160;
                  <strong>{item?.complements.map(c => c.name).join(', ')}</strong>
                </ListItem>}
                {item?.comment && <ListItem sx={{ pt: '2px', pb: '2px', display: 'flex', flexWrap: 'wrap' }}>
                  Observação:&#160;
                  <strong>{item?.comment}</strong>
                </ListItem>}
                <ListItem sx={{ pt: '2px', pb: '2px', display: 'flex', flexWrap: 'wrap' }}>
                  Quantidade:&#160;<strong>{item.quantity}</strong>
                </ListItem>
                <ListItem sx={{ pt: '2px', pb: '2px', display: 'flex', flexWrap: 'wrap' }}>
                  Valor:&#160;<strong>{item.priceTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </ListItem>
              </div>
              <img src={item.imageUrl} alt={`Imagem do produto ${item.prodcutName}`} />
            </S.ProductInfo>
          ))}
        </List>
        <Typography variant="h6" style={{ marginTop: 20, textAlign: 'end' }}>
          Subtotal: {order.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} <br />
          {order.deliveryType === 'delivery' && (
            order.address.deliveryOtpion === 'customerPickup'
              ? <>Taxa de entrega: A combinar <br /></>
              : <>Taxa de entrega: R$ {order.address.price?.toFixed(2)} <br /></>
          )}
          Total: {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Typography>
      </S.CustomPaper>
    </Dialog>
  );
};

export default OrderDetailsModal;
