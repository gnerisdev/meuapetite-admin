import { Container, Typography } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md" style={{ background: '#fff', color: '#000', padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Termos de Uso
      </Typography>
      <Typography paragraph>
        Bem-vindo ao Meu Apetite! Ao usar nosso serviço, você concorda com os seguintes termos e condições:
      </Typography>
      <Typography paragraph>
        1. <strong>Conta e Segurança:</strong> Você é responsável por manter a confidencialidade de suas informações de login.
      </Typography>
      <Typography paragraph>
        2. <strong>Uso Adequado:</strong> Não é permitido o uso indevido do serviço para atividades ilegais ou antiéticas.
      </Typography>
      <Typography paragraph>
        3. <strong>Conteúdo:</strong> Todo o conteúdo fornecido no aplicativo é apenas para fins informativos. Não garantimos a precisão ou integridade do conteúdo.
      </Typography>
      <Typography paragraph>
        4. <strong>Modificações:</strong> Reservamos o direito de modificar ou encerrar o serviço a qualquer momento sem aviso prévio.
      </Typography>
      <Typography paragraph>
        5. <strong>Entrega e Taxas:</strong> Utilizamos a API do TomTom para calcular distâncias e taxas de entrega. O cliente pode aceitar ou optar por outros métodos de entrega disponíveis.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Política de Privacidade
      </Typography>
      <Typography paragraph>
        Sua privacidade é importante para nós. Esta Política de Privacidade descreve como suas informações pessoais são coletadas, usadas e compartilhadas ao usar nosso serviço.
      </Typography>
      <Typography paragraph>
        1. <strong>Informações Coletadas:</strong> Coletamos informações pessoais, como nome, endereço de e-mail e preferências de comida para melhorar a experiência do usuário.
      </Typography>
      <Typography paragraph>
        2. <strong>Uso de Cookies:</strong> Utilizamos cookies para melhorar a funcionalidade do aplicativo e personalizar a experiência do usuário.
      </Typography>
      <Typography paragraph>
        3. <strong>Compartilhamento de Informações:</strong> Não compartilhamos suas informações com terceiros sem sua permissão, exceto quando necessário para fornecer o serviço.
      </Typography>
      <Typography paragraph>
        4. <strong>Segurança:</strong> Implementamos medidas de segurança para proteger suas informações pessoais contra acesso não autorizado ou divulgação.
      </Typography>
      <Typography paragraph>
        5. <strong>Gerenciamento de Categoria e Produtos:</strong> Oferecemos funcionalidades para o cadastro e gerenciamento de categorias e produtos, proporcionando uma experiência personalizada de compra.
      </Typography>
      <Typography paragraph>
        6. <strong>Dados de Pedidos e Entrega:</strong> Armazenamos dados de pedidos e informações de entrega para melhorar a eficiência do serviço.
      </Typography>
      <Typography paragraph>
        7. <strong>Customização de Cores e Exibição:</strong> Permitimos a customização de cores e exibição para atender às preferências do usuário.
      </Typography>
    </Container>
  );
};

export default Terms;
