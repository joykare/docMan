import db from '../models';
import validate from '../ControllerUtils/RoleUtils';

const Role = db.Role;

const RoleController = {

  /**
   * create - create a new Role
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   * @returns {void} - returns void
   */
  create(req, res) {
    validate(req).then((role) => {
      switch (role) {
        case 'Fields Missing':
          res.status(403).send({
            message: 'Some Fields are missing'
          });
          break;
        case true:
          res.status(409).send({
            message: 'Role already exists'
          });
          break;
        default:
          Role.create(req.body)
          .then(() => res.status(200).send({
            message: 'Role successfully created'
          }));
          break;
      }
    });
  },

  /**
   * fetchRoles - return all roles
   * @param {Object} request Request object
   * @param {Object} response Response object
   * @returns {Object} res Response object
   */
  fetchRoles(request, response) {
    const query = {};

    query.order = [
      ['createdAt', 'DESC']
    ];
    if (Number(request.query.limit) >= 0) query.limit = request.query.limit;
    if (Number(request.query.offset) >= 0) {
      query.offset = (request.query.offset -
        1) * 10;
    }
    Role.findAndCountAll().then((roles) => {
      const totalCount = roles;
      Role.findAll(query)
        .then(foundRoles => response.status(200).json({
          foundRoles,
          pagination: {
            page: Number(request.query.offset) || null,
            pageCount: Math.floor((totalCount.count + 1) / 10),
            page_size: Number(query.limit) || null,
            total_count: totalCount.count + 1
          }
        }));
    });
  },

  /**
   * updateRole - update a role
   * @param {Object} request request object
   * @param {Object} response response object
   * @returns {void} - returns void
   */
  updateRole(request, response) {
    Role.findById(request.params.id)
      .then((foundRole) => {
        if (!foundRole) {
          response.status(404).send({
            message: 'Role Not Found'
          });
        }
        if (foundRole.title !== 'admin') {
          foundRole.update(request.body)
            .then((updatedRole) => {
              response.status(201).send({
                updatedRole
              });
            });
        } else {
          response.status(403).send({
            message: 'You are not permitted to perform this action'
          });
        }
      });
  },

  /**
   * deleteRole -  delete a role
   * @param {Object}  request request object
   * @param {Object}  response response object
   * @returns {void} - returns void
   */
  deleteRole(request, response) {
    Role.findById(request.params.id)
      .then((foundRole) => {
        if (!foundRole) {
          response.status(404).send({
            message: 'Role Not Found'
          });
        }
        if (foundRole) {
          if (foundRole.title !== 'admin') {
            foundRole.destroy()
              .then(() => {
                response.status(200).send({
                  message: 'Role was successfully deleted'
                });
              });
          } else {
            response.status(403).send({
              message: 'You are not permitted to perform this action'
            });
          }
        }
      });
  },

  /**
   * retrieve -  return a role
   * @param {Object}  request request object
   * @param {Object}  response response object
   * @returns {void} - returns void
   */
  retrieve(request, response) {
    Role.findById(request.params.id)
      .then((role) => {
        if (!role) {
          return response.status(404).send({
            message: 'Role does not exists'
          });
        }

        return response.status(200).send({
          role
        });
      });
  }
};

export default RoleController;
