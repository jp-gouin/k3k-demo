# How apply network policies in shared mode

1. Create two namespaces
```
kubectl create namespace namespace-one
kubectl create namespace namespace-two
```
1. Create the Nginx pods
```
kubectl run nginx-one --image=nginx:latest --namespace=namespace-one --labels="app=nginx-one" --port=80
k expose -n namespace-one pod nginx-one --port 80 --target-port 80
kubectl run nginx-two --image=nginx:latest --namespace=namespace-two --labels="app=nginx-two" --port=80
k expose -n namespace-two pod nginx-two --port 80 --target-port 80
```
2. apply a NetworkPolicy to Deny External Access to nginx-one
```
kubectl label namespaces namespace-one name=namespace-one
```

```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-other-namespaces
  namespace: namespace-one
spec:
  podSelector: {}
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: namespace-one
```

Network Policy Enforcement: Ensure your CNI plugin supports NetworkPolicy.
Namespace Scope: The network policy needs to be applied in both namespaces to prevent cross-namespace communication in both directions. The --namespace flag in the kubectl apply command ensures this.