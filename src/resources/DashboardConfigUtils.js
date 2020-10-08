export const createNewConfig = (params, props) => {

  return {
    resourcePath: window.location.pathname,
    resourceName: props.kind.slice(0, -4),
    favourite: false,
    render: {
      columns: [
        {
          columnName: 'Name',
          parameter: 'param.metadata.name%//'
        },
        {
          columnName: 'Namespace',
          parameter: 'param.metadata.namespace%//'
        }
      ]
    }
  }
}
