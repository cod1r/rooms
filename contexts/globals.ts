import { createContext } from 'react';
let globals = {
	authenticated: false,
	in_room: false,
	setAuthenticated: (state) => {},
	setInRoom: (state) => {},
	theme: {
		light: '',
		dark: ''
	}
}
let GLOBALS = createContext(globals);
export { GLOBALS }
