# Quota Experimentation

## Single cluster

Run a single cluster with: 

```
 serverLimit:
    memory: "500Mi"
    cpu: "500m"
```

and a clusterSet with: 

```
spec:
  allowedModeTypes:
  - shared
  displayName: tenant-teama
  limit:
    limits:
    - default:
        cpu: "0.2"
        memory: 200Mi
      defaultRequest:
        cpu: 50m
        memory: 100Mi
      max:
        cpu: "1"
        memory: 600Mi
      type: Container
  quota:
    hard:
      cpu: "2"
      memory: 5Gi
```

After the deployment and Rancher import, the quota is

```
NAME          AGE    REQUEST                           LIMIT
k3k-default   109m   cpu: 950m/2, memory: 1270Mi/5Gi   
```

## The minimal value for K3s server 

A cluster with the following limit get OOM Killed at during first startup once before running: 
```
serverLimit:
    memory: "400Mi"
    cpu: "400m"
```

It's safe to assume 500Mi is the minimal Memory value. 