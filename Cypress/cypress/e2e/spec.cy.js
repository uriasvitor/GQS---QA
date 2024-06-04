describe('API de Matrículas', () => {
  const baseUrl = 'http://localhost:8080/v1/matriculas';
  const apiKey = 'unime-qualidade-oficial2';

  const headers = {
    'X-API-KEY': apiKey
  };

  const checkCommonFields = (body, expectedId) => {
    expect(body).to.have.property('id', expectedId);
    expect(body).to.have.property('courseName');
    expect(body).to.have.property('student');
    expect(body.student).to.have.property('firstName');
    expect(body.student).to.have.property('lastName');
    expect(body.student).to.have.property('birthDate');
    expect(body.student).to.have.property('cpf');
  };

  it('Deve retornar os dados de uma matrícula regular', () => {
    const matriculaId = '4653421';
    cy.request({
      method: 'GET',
      url: `${baseUrl}/${matriculaId}`,
      headers
    }).then((response) => {
      expect(response.status).to.eq(200);
      checkCommonFields(response.body, matriculaId);
      expect(response.body).to.have.property('tuition');
      expect(response.body.tuition).to.have.property('amount');
      expect(response.body.tuition).to.have.property('formattedAmount');
      expect(response.body.tuition).to.have.property('dueDate');
      expect(response.body.tuition).to.have.property('status', 'EM_DIA');
    });
  });

  it('Deve retornar erro para matrícula com mensalidade atrasada', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/5566778`,
      headers,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body).to.have.property('mensagem', 'A matrícula informada possui débitos em aberto. Não é possível obter dados da mesma até a quitação!');
    });
  });

  it('Deve retornar os dados de um aluno bolsista 100% sem mensalidade e data de vencimento', () => {
    const matriculaId = '7890123';
    cy.request({
      method: 'GET',
      url: `${baseUrl}/${matriculaId}`,
      headers
    }).then((response) => {
      expect(response.status).to.eq(200);
      checkCommonFields(response.body, matriculaId);
      expect(response.body.tuition).to.have.property('status', 'BOLSISTA_100');
      expect(response.body.tuition).to.not.have.property('amount');
      expect(response.body.tuition).to.not.have.property('formattedAmount');
      expect(response.body.tuition).to.not.have.property('dueDate');
    });
  });

  it('Deve retornar os dados de um aluno bolsista 50% sem status bolsista', () => {
    const matriculaId = '1113499';
    cy.request({
      method: 'GET',
      url: `${baseUrl}/${matriculaId}`,
      headers
    }).then((response) => {
      expect(response.status).to.eq(200);
      checkCommonFields(response.body, matriculaId);
      expect(response.body).to.have.property('tuition');
      expect(response.body.tuition).to.have.property('amount');
      expect(response.body.tuition).to.have.property('formattedAmount');
      expect(response.body.tuition).to.have.property('dueDate');
      expect(response.body.tuition).to.have.property('status', 'BOLSISTA_50');
    });
  });

  it('Deve retornar os dados de um aluno com todas as mensalidades quitadas sem data de vencimento', () => {
    const matriculaId = '1122334';
    cy.request({
      method: 'GET',
      url: `${baseUrl}/${matriculaId}`,
      headers
    }).then((response) => {
      expect(response.status).to.eq(200);
      checkCommonFields(response.body, matriculaId);
      expect(response.body).to.have.property('tuition');
      expect(response.body.tuition).to.have.property('status', 'CONTRATO_QUITADO');
      expect(response.body.tuition).to.not.have.property('dueDate');
    });
  });

  it('Deve retornar erro para matrícula excluída', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/4653499`,
      headers,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('mensagem', 'A matrícula informada foi excluída de nossa base de dados!');
    });
  });

  it('Deve retornar erro para matrícula inválida', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/XPTO123`,
      headers,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('mensagem', 'A matrícula informada não parece ser válida!');
    });
  });

  it('Deve retornar erro para matrícula inexistente', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/1234567`,
      headers,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('mensagem', 'A matrícula informada não foi localizada em nossa base de dados!');
    });
  });

  it('Deve retornar erro quando o header X-API-KEY estiver ausente', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/4653421`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('mensagem', 'A API Key informada é inválida!');
    });
  });
});
