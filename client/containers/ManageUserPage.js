import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import toastr from 'toastr';
import * as userAction from '../actions/userAction';
import UserForm from '../components/userForm';


class ManageUserPage extends React.Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			user: Object.assign({}, this.props.user),
			errors: {},
			saving: false
		}
		this.updateUserState = this.updateUserState.bind(this);
		this.saveUser = this.saveUser.bind(this);
	}
	updateUserState(event) {
		console.log(event.target.value)
		const field = event.target.name;
		let user = this.state.user;
		user[field] = event.target.value;
		this.setState({ user: user })
	}

	saveUser() {
		event.preventDefault();
		this.props.saveUser(this.state.user);
		console.log(this.state.user, 'state user');
		window.location = '/';
		this.setState({ saving: true });
		toastr.success('User saved')
	}

	render() {
		return (
			<div>
				<center>
					<h5 className="indigo-text">Create account</h5>
				</center>
				<UserForm
					user={this.state.user}
					onChange={this.updateUserState}
					onSave={this.saveUser}
					error={this.state.error} />
			</div>
		)
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		saveUser: (user) => dispatch(userAction.saveUser(user)),
		fetchUsers: () => dispatch(userAction.fetchUsers())
	}

}

const mapStateToProps = (state, ownProps) => {
	let user = { firstname: '', lastname: '', username: '', email: '', password: '', roleId: '' }
	return {
		user: user
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(ManageUserPage);