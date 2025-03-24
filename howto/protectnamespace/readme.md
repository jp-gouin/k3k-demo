# How to protect a tenant namespace

The LimitRange and ResourceQuota work together to provide comprehensive resource management and tenant protection within a Kubernetes namespace. Here's a breakdown of their combined purpose:

1. Preventing Resource Starvation (LimitRange):

Default Resource Requests: A LimitRange forces pods to have default resource requests even if the pod's manifest doesn't explicitly specify them. Without this, pods could be created without any resource reservations, leading to unpredictable scheduling and potential resource contention.
Default Resource Limits: Similarly, it sets default resource limits. This prevents pods from consuming excessive resources and potentially crashing the node or affecting other pods.
Maximum Resource Limits: It sets maximum resource limits for individual containers within pods. This is crucial for preventing "noisy neighbor" problems, where a single pod consumes an unfair share of resources and impacts other pods in the namespace.

2. Enforcing Namespace-Level Resource Boundaries (ResourceQuota):

Total Resource Consumption: A ResourceQuota sets hard limits on the total amount of resources (CPU, memory) that can be consumed by all pods within a namespace. This prevents a single tenant (namespace) from monopolizing cluster resources.
Pod Count (Optional): As demonstrated in the first example, it can also limit the number of pods in a namespace, providing further control.
Resource Requests vs. Limits: It enforces both resource requests and limits at the namespace level, ensuring that tenants adhere to both scheduling and consumption constraints.

## Example
In the following [example](./limitquota.yaml), a Pod should not be able to request more than `0.2` cpu and `200Mi` of Rams. 
The namespace (tenant) should not consume more than `0.6` cpu and `600Mi` of Rams

This ensure that inside a tenant a user cannot consume all available resources and that a tenant cannot consume all host resources.

1. Run a pod with : 
```
resources:
    requests:
        cpu: 200m
        memory: 200Mi
```

Expected result:

2. Run a pod with:
```
resources:
    requests:
        cpu: 1m
        memory: 1Gi
```

Expected result: 
- Pod is not scheduled as it violate the limitRange, information is available from the `virtual cluster`
```
Pod "nginx2-default-sharedm-cluster1-6e67696e78322b64656661756-a62f8" is invalid: spec.containers[0].resources.requests: Invalid value: "1Gi": must be less than or equal to memory limit of 200Mi Pod "nginx2-default-sharedm-cluster1-6e67696e78322b64656661756-a62f8" is invalid: spec.containers[0].resources.requests: Invalid value: "1Gi": must be less than or equal to memory limit of 200Mi Pod "nginx2-default-sharedm-cluster1-6e67696e78322b64656661756-a62f8" is invalid: spec.containers[0].resources.requests: Invalid value: "1Gi": must be less than or equal to memory limit of 200Mi Pod "nginx2-default-sharedm-cluster1-6e67696e78322b64656661756-a62f8" is invalid: spec.containers[0].resources.requests: Invalid value: "1Gi": must be less than or equal to memory limit of 200Mi Pod "nginx2-default-sharedm-cluster1-6e67696e78322b64656661756-a62f8" is invalid: spec.containers[0].resources.requests: Invalid value: "1Gi": must be less than or equal to memory limit of 200Mi provider timed out
```

3. Run a pod without limit/request
Expected result:
- Pod is scheduled and the default limit/request defined in the limitRange is applied

On the `virtual cluster` **no information is available**
On the `host cluster` the pod is created with
```
resources:
    limits:
        cpu: 200m
        memory: 200Mi
    requests:
        cpu: 100m
        memory: 100Mi
```

1. Run another pod wihthout limit/request

Expected result:
- Pod is not scheduled as it violate the maximun quota available
  The default `default` limit in the limitRange will max out the remaining space available `limits.memory: 570Mi/600Mi`
```
pods "nginx4-default-sharedm-cluster1-6e67696e78342b64656661756-819eb" is forbidden: exceeded quota: namespace-resource-quota, requested: limits.memory=200Mi, used: limits.memory=570Mi, limited: limits.memory=600Mi pods "nginx4-default-sharedm-cluster1-6e67696e78342b64656661756-819eb" is forbidden: exceeded quota: namespace-resource-quota, requested: limits.memory=200Mi, used: limits.memory=570Mi, limited: limits.memory=600Mi pods "nginx4-default-sharedm-cluster1-6e67696e78342b64656661756-819eb" is forbidden: exceeded quota: namespace-resource-quota, requested: limits.memory=200Mi, used: limits.memory=570Mi, limited: limits.memory=600Mi pods "nginx4-default-sharedm-cluster1-6e67696e78342b64656661756-819eb" is forbidden: exceeded quota: namespace-resource-quota, requested: limits.memory=200Mi, used: limits.memory=570Mi, limited: limits.memory=600Mi pods "nginx4-default-sharedm-cluster1-6e67696e78342b64656661756-819eb" is forbidden: exceeded quota: namespace-resource-quota, requested: limits.memory=200Mi, used: limits.memory=570Mi, limited: limits.memory=600Mi provider timed out
```