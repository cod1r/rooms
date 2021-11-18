import React from 'react';
let authstates = {
	authenticated : false,
	in_room : false,
	setAuthenticated : (state) => {},
	setInRoom : (state) => {}
}
let AuthStates = React.createContext(authstates);
export {AuthStates, authstates}
