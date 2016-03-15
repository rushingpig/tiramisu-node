import React from 'react';
import LineRouter from './common/line_router';

const getTopHeader = routes => props => (
    <div className="clearfix top-header">
        <LineRouter routes={routes} />
    </div>
);

export default getTopHeader;