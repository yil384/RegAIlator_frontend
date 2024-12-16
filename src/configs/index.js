const config = {
    // basename: only at build time to set, and don't add '/' at end off BASENAME for breadcrumbs, also don't put only '/' use blank('') instead,
    // like '/berry-material-react/react/default'
    basename: '/',
    dashboardPath: '/dashboard',
    defaultPath: '/session/login',
    // fontFamily: `'Roboto', sans-serif`,
    fontFamily: `'Poppins', sans-serif`,
    borderRadius: 12,
    env: 'prod',
    // env: 'local',
    prod: {
        baseURL: 'https://regailator.com',
        httpURL: 'https://regailator.com/api/v1',
        wsURL: 'https://regailator.com/socket.io'
    },
    local: {
        baseURL: 'http://localhost:3000',
        httpURL: 'http://localhost:3000/api/v1',
        wsURL: 'http://localhost:3000/socket.io'
    }
};

export default config;
