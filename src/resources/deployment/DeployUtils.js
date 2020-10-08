export const getDeployStatus = deploy => {
  const totalReplicas = deploy.status.replicas;
  const totalUp = deploy.status.readyReplicas ? deploy.status.readyReplicas : 0;

  return {
    OK: totalUp === totalReplicas,
    available: totalUp + '/' + totalReplicas
  };
}
