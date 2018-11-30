export const CONNECTION_ADDED = 'connection-added';
export const CONNECTION_MOVED = 'connection-moved';
export const CONNECTION_DELETED = 'connection-deleted';

export const FETCH_CONNECTIONS_REQUEST = 'fetch-connections-request';
export const FETCH_CONNECTIONS_SUCCESS = 'fetch-connections-success';
export const FETCH_CONNECTIONS_FAILURE = 'fetch-connections-failure';

export const FETCH_ONE_CONNECTION_REQUEST = 'fetch-one-connection-request';
export const FETCH_ONE_CONNECTION_FAILURE = 'fetch-one-connection-failure';


// === Action Creators ========================================================

export const connectionAdded = (name, ep1Device, ep2Device) => ({
  type: CONNECTION_ADDED, name, item: { ep1Device, ep2Device }
});

export const connectionMoved = (name, endpoint, device, nsInfo) => ({
  type: CONNECTION_MOVED, name, endpoint, device, nsInfo
});

export const connectionDeleted = name => ({
  type: CONNECTION_DELETED, name
});


// === JsonRpc Middleware =====================================================

const path = '/l3vpn:topology/connection';
const selection = [ 'name',
                    'endpoint-1/device',
                    'endpoint-1/ns-info-id',
                    'endpoint-1/connection-point',
                    'endpoint-2/device',
                    'endpoint-2/ns-info-id',
                    'endpoint-2/connection-point' ];
const resultKeys = [ 'name',
                     'ep1Device',
                     'ep1NsInfo',
                     'ep1Cp',
                     'ep2Device',
                     'ep2NsInfo',
                     'ep2Cp' ];

export const fetchConnections = () => ({
  jsonRpcQuery: {
    xpathExpr   : path,
    selection   : selection,
    resultKeys  : resultKeys,
    objectKey   : 'name'
  },
  types: [
    FETCH_CONNECTIONS_REQUEST,
    FETCH_CONNECTIONS_SUCCESS,
    FETCH_CONNECTIONS_FAILURE
  ],
  errorMessage: 'Failed to fetch connections'
});

export const fetchOneConnection = name => ({
  jsonRpcGetValues: {
    name          : name,
    path        : `${path}{${name}}`,
    leafs       : selection,
    resultKeys  : resultKeys,
  },
  types: [
    FETCH_ONE_CONNECTION_REQUEST,
    CONNECTION_ADDED,
    FETCH_ONE_CONNECTION_FAILURE
  ],
  errorMessage: `Failed to fetch connection ${name}`
});

export const deleteConnection = name => ({
  jsonRpcDelete: { path, name },
  types: [ CONNECTION_DELETED ],
  errorMessage: `Failed to delete connection ${name}`
});

export const addConnection = (name, ep1Device, ep2Device) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{${name}}/endpoint-1/device`, value: ep1Device },
    { path: `${path}{${name}}/endpoint-2/device`, value: ep2Device }
  ]},
  actions: [ connectionAdded(name, ep1Device, ep2Device) ],
  errorMessage: `Failed to add connnection ${name}`
});

export const moveConnection = (name, endpoint, device, nsInfo) => ({
  jsonRpcSetValues: { pathValues: [
    { path: `${path}{${name}}/endpoint-${endpoint}/device`,
      value: device || null },
    { path: `${path}{${name}}/endpoint-${endpoint}/ns-info-id`,
      value: nsInfo || null }
  ]},
  actions: [ connectionMoved(name, endpoint, device, nsInfo) ],
  errorMessage: `Failed to move connection ${name}`
});


// === Comet Middleware =======================================================

export const subscribeConnections = () => ({
  subscribe: {
    path: '/l3vpn:topology/connection',
    cdbOper: false
  },
  actions: [ fetchOneConnection, connectionDeleted ]
});
