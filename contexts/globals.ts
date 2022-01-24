import { createContext } from 'react';
let globals = {
	authenticated: false,
	in_room: false,
	setAuthenticated: (state) => {},
	setInRoom: (state) => {},
	colorMode: null,
	setColorMode: (state) => {},
};
let GLOBALS = createContext(globals);
export { GLOBALS };
