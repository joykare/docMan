import chai from 'chai';
import supertest from 'supertest';
import app from '../../../server';
import db from '../../models';
import helper from '../test-helper';

const expect = chai.expect;
const request = supertest(app);
const userParams = helper.adminUser;
const roleParams = helper.adminRole;
const regularRole = helper.regularRole;

let role,
  token;

describe('Role API', () => {
  before((done) => {
    db.Role.create(roleParams)
      .then((newRole) => {
        userParams.roleId = newRole.id;
        db.User.create(userParams)
          .then(() => {
            request.post('/api/users/login')
              .send(userParams)
              .end((err, res) => {
                if (err) return err;
                token = res.body.token;
                done();
              });
          });
      });
  });

  after(() => db.sequelize.sync({ force: true }));

  describe('Create new Role', () => {
    beforeEach(() => {
      db.Role.create(regularRole)
        .then((newRole) => {
          role = newRole;
        }).catch(error => error);
    });

    after(() => db.Role.destroy({ where: { id: role.id } }));

    it('should return unauthorised without a token', (done) => {
      request.get('/api/roles')
        .end((err, res) => {
          if (err) return err;
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal(
            'Token required to access this route');
          done();
        });
    });

    it('should return all roles to an admin user', (done) => {
      request.get('/api/roles')
        .set({ Authorization: token })
        .end((err, res) => {
          if (err) return err;
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should not create a new role if title fields is missing', () => {
      request.post('/api/roles')
        .set({ Authorization: token })
        .send({})
        .end((err, response) => {
          if (err) return err;
          expect(response.status).to.equal(403);
        });
    });

    it('should not create a role that already exists', () => {
      request.post('/api/roles')
        .set({ Authorization: token })
        .send({ title: 'admin' })
        .end((err, response) => {
          if (err) return err;
          expect(response.status).to.equal(409);
        });
    });

    it('should fail for invalid attributes', () => {
      request.post('/api/roles')
        .send({ name: 'hello' })
        .set({ Authorization: token })
        .end((err, response) => {
          if (err) return err;
          expect(response.status).to.equal(403);
        });
    });

    it('should return the correct role when a valid id is passed', (
      done) => {
      request.get(`/api/roles/${role.id}`)
        .set({ Authorization: token })
        .end((err, response) => {
          if (err) return err;
          expect(response.status).to.equal(200);
          done();
        });
    });

    it('should update an existing role', (done) => {
      request.put(`/api/roles/${role.id}`)
        .send({ title: 'role' })
        .set({ Authorization: token })
        .end((err, response) => {
          if (err) return err;
          expect(response.status).to.equal(201);
          done();
        });
    });

    it('should delete a role', (done) => {
      request.delete(`/api/roles/${role.id}`)
        .set({ Authorization: token })
        .end((err, response) => {
          if (err) return err;
          expect(response.status).to.equal(200);
          done();
        });
    });
  });
});
