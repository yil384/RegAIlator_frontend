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
    prod: {
        baseURL: 'http://3.137.84.84/api/v1/',
        // baseURL: 'http://localhost:3000/v1/',
    }
};

export default config;
