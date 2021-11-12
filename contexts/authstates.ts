import React from 'react';
let authstates = {
	authenticated : false,
	in_room : false,
	setAuthenticated : () => {},
	setInRoom : () => {}
}
let AuthStates = React.createContext(authstates);
export {AuthStates, authstates}
