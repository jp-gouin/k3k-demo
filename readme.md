# Demo of K3K
Enable local path provisioning on the host cluster
```
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.30/deploy/local-path-storage.yaml
kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

## Deploy the chart
```
helm install -n k3k-system --create-namespace k3k k3k
```

## Connect to the cluster
```
export KUBECONFIG=$(pwd)/kube_config_workload.yaml
k create ns demo-1
k apply -f single-server-1.yaml
k get po -n demo-1 -w
```

Generate Kubeconfig
```
./k3kcli kubeconfig generate  --namespace demo-1 --name mycluster1
```

## Deploy App
Deploy Nginx
```
export KUBECONFIG=$(pwd)/mycluster1-kubeconfig.yaml
k apply -f  https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/baremetal/deploy.yaml
```

```
k apply -f suse-demo/kubernetes/app.yaml
```

Get nodeport and access the app
```
k get svc -n demo-2 
http://suseapp.18.209.95.12.sslip.io:30368/
```

## Install cert-manager

List CRDs in host -> no cert-manager crd
```
export KUBECONFIG=$(pwd)/kube_config_workload.yaml
k get crd
```

```
export KUBECONFIG=$(pwd)/mycluster-kubeconfig.yaml
k  apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml
```

List CRDs -> cert-manager crd in k3k cluster
```
k get crd
```

List CRDs in host -> no cert-manager crd
```
export KUBECONFIG=$(pwd)/kube_config_workload.yaml
k get crd

```

## Deploy another cluster

```
k create demo-2
./k3kcli cluster create  --namespace demo-2 --name mycluster2 --service-cidr "10.43.0.0/16"
```

## Showcase CRD isolation

```
export KUBECONFIG=$(pwd)/mycluster2-kubeconfig.yaml
k apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.4/cert-manager.yaml
```

## Import cluster in Rancher



