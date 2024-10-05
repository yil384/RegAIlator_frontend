import React from 'react';

// material-ui
import { Link, Typography, Stack } from '@material-ui/core';

//-----------------------|| FOOTER - AUTHENTICATION 2 & 3 ||-----------------------//

const AuthFooter = () => {
    return (
        <Stack direction='row' justifyContent='space-between'>
            <Typography variant='subtitle2' component={Link} href='https://xr.kent.edu/' target='_blank'
                        underline='hover'>
                xr.kent.edu
            </Typography>
            <Typography variant='subtitle2' component={Link} href='https://www.kent.edu/' target='_blank'
                        underline='hover'>
                Copyright &copy; Kent State University &nbsp;
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        </Stack>
    );
};

export default AuthFooter;
