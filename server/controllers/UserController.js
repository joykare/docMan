import jwt from 'jsonwebtoken';
import { User } from '../models';
import UserUtils from '../ControllerUtils/UserUtils';
import authentication from '../middlewares/Authentication';

const secret = 'supersecret';

const UserController = {
  /**
   * creates a document
   * @param {Object} request object
   * @param  {Object} response object
   * @returns {Object} response object
   */
  create(request, response) {
    UserUtils.validate(request).then(() => {
      User.create(request.body)
        .then(user => response.status(200).send({
          message: 'User successfully created',
          token: authentication.generateToken(user),
          userId: user.dataValues.id,
          roleId: user.dataValues.roleId
        })).catch(error => response.status(error.status).send({
          message: error.message
        })).catch(error => response.status(error.status).send({
          message: error.message
        }));
    }).catch((error) => {
      response.status(error.status).send({
        message: error.message
      });
    });
  },

  /**
   * deletes a user
   * @param {Object} request object
   * @param {Object} response object
   * @returns {void} - returns void
   */
  deleteUser(request, response) {
    UserUtils.ifUserExists(request).then((foundUser) => {
      foundUser.destroy()
        .then(() => response.status(200).send({
          message: 'User successfully deleted'
        }));
    }).catch((error) => {
      response.status(error.status).send({
        message: error.message
      });
    });
  },

  /** update
   * updates a user
   * @param {Object} request object
   * @param {Object} response object
   * @returns {void} - returns void
   */
  update(request, response) {
    UserUtils.ifUserExists(request).then((foundUser) => {
      foundUser.update(request.body)
        .then(() => response.status(200).send({
          message: 'User successfully Updated'
        }));
    }).catch((error) => {
      response.status(error.status).send({
        message: error.message
      });
    });
  },

  /** logout
   * logs a user out
   * @param {Object} request object
   * @param {Object} response object
   * @returns {void} - returns void
   */
  logout(request, response) {
    response.status(200).send({
      message: 'User successfully logged out'
    });
  },

  /** index
   * returns all users
   * @param {Object} request object
   * @param {Object} response object
   * @returns {void} - returns void
   */
  index(request, response) {
    const query = {};
    query.order = [
      ['createdAt', 'DESC']
    ];
    if (Number(request.query.limit) >= 0) query.limit = request.query.limit;
    if (Number(request.query.offset >= 0)) query.offset = request.query.offset;
    User.findAndCountAll().then((users) => {
      const totalCount = users;
      /* eslint-disable no-shadow */
      User.findAll(query)
        .then((users) => {
          const pageCount = (totalCount + 1) / 10;
          return response.status(200).json({
            users,
            pagination: UserUtils.indexPagination(request,
              pageCount, totalCount, query)
          });
        });
    });
  },

  /** retrieve
   * returns a particular user
   * @param {Object} request object
   * @param {Object} response object
   * @returns {void} - returns void
   */
  retrieve(request, response) {
    UserUtils.ifUserExists(request, true).then(foundUser => response.status(
      200).send(
      UserUtils.userDetails(foundUser)
    )).catch(error => response.status(error.status).send({
      message: error.message
    }));
  },

  /** login
   * logs a user into the application
   * @param {Object} request object
   * @param {Object} response object
   * @returns {void} - returns void
   */
  login(request, response) {
    User.findOne({ where: { email: request.body.email } })
      .then((user) => {
        if (user && user.validPassword(request.body.password)) {
          const token = jwt.sign({
            UserId: user.id,
            RoleId: user.roleId
          }, secret, {
            expiresIn: '2 days'
          });
          return response.status(200).send({
            userIdentity: user.id,
            token,
            expiresIn: '2 days',
          });
        }
        return response.status(401).send({
          message: 'failed to authenticate user'
        });
      });
  },
};

export default UserController;
