export const getPodStatus = pod => {
  let totalUp = 0;
  let totalContainers = 0;
  let totalRestarts = 0;
  let status = {
    reason: 'Running',
    message: 'Pod running'
  };

  if(pod.status.containerStatuses){
    totalContainers = pod.status.containerStatuses.length;

    pod.status.containerStatuses.forEach(co => {
      if(!co.ready){
        if(co.state.waiting)
          status = co.state.waiting;
        else status = co.state.terminated;
      }
      totalRestarts += co.restartCount;
      co.ready ? totalUp++ : null;
    })
  } else {
    status.reason = pod.status.reason;
    status.message = pod.status.message;
  }

  return {
    totalRestarts: totalRestarts,
    ready: totalUp + '/' + totalContainers,
    status: status,
    OK: status.reason === 'Running'
  };
}
