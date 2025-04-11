# How to deploy Rancher server in a shared mode virtual cluster

## Prepare the host
Rancher need a priority class to run it's pods 
This should be removed by the syncer 
At the moment deploy it on the host cluster

```
apiVersion: scheduling.k8s.io/v1
description: Priority class used by pods critical to rancher's functionality.
kind: PriorityClass
metadata:
  annotations:
    meta.helm.sh/release-name: rancher
    meta.helm.sh/release-namespace: cattle-system
  name: rancher-critical
preemptionPolicy: PreemptLowerPriority
value: 1000000000

```
## Deploy the chart
1. Create the namespace
```
kubectl create namespace cattle-system
```
2. Generate a certificate (or deploy cert-manager)
```
openssl req -x509 -newkey rsa:4096 -keyout tls.key -out tls.crt -days 365 -nodes -subj "/CN=vcrancher.x.x.x.x.sslip.io"
kubectl create secret tls tls-rancher-ingress \
  --namespace cattle-system \
  --key tls.key \
  --cert tls.crt
```
3. Deploy Nginx
```
k apply -f  https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/baremetal/deploy.yaml
```
Edit the nginx deployment to add `--watch-ingress-without-class=true` flag
4. Deploy the chart
```
helm install rancher rancher-stable/rancher \
  --namespace cattle-system \
  --set hostname=vcrancher.x.x.x.x.sslip.io \
  --set bootstrapPassword=admin \
  --set ingress.tls.source=secret --set ingress.tls.secretName=tls-rancher-ingress
```
## Tweak the ingress
Add the IngressClassName to the ingress or configure your ingress controller to work without

To configure the NGINX Ingress Controller to watch Ingress resources without an ingressClassName, you need to ensure the controller is configured to handle Ingress resources that don't specify a class, either by setting the default controller class or by using the `--watch-ingress-without-class` flag. 
