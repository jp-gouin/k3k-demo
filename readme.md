# Demo of K3K
Enable local path provisioning on the host cluster
```
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.30/deploy/local-path-storage.yaml
kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```
Ingress Controller (Nginx)
RKE2 deploy nginx out of the box, if you want to expose the K3k cluster using it you need to enable `ssl-passthough` 
```
k edit daemonsets.apps -n kube-system rke2-ingress-nginx-controller
```
Add the following flag in the container args
```
- --enable-ssl-passthrough
```

Deploy Metallb to provide loadbalancing IPs 
```
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/main/config/manifests/metallb-native.yaml
```
```
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: public-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 3.87.157.111/32  # Replace with your actual public IP
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: public-ip-advert
  namespace: metallb-system
EOF
```

## Deploy the chart
```
helm install -n k3k-system --create-namespace k3k k3k
helm install -n k3k-system --create-namespace k3k --devel k3k/k3k

helm install -n k3k-system --create-namespace k3k --set image.repository=jpgouin/k3k --set image.tag=f6fe819-amd64 --set sharedAgent.image.repository=jpgouin/k3k --set sharedAgent.image.tag=f6fe819-amd64-kubelet --set image.pullPolicy=Always --devel k3k/k3k
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

## Install kubewarden-crds

List CRDs in host -> no kubewarden crds
```
export KUBECONFIG=$(pwd)/kube_config_workload.yaml
k get crd
```

```
export KUBECONFIG=$(pwd)/mycluster-kubeconfig.yaml
helm install --wait -n kubewarden --create-namespace kubewarden-crds kubewarden/kubewarden-crds
helm install --wait -n kubewarden kubewarden-controller kubewarden/kubewarden-controller
```

List CRDs -> kubewarden crds in k3k cluster
```
k get crd
```

List CRDs in host -> no kubewarden crds
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
helm install --wait -n kubewarden --version 1.11.0 --create-namespace kubewarden-crds kubewarden/kubewarden-crds
helm install --wait -n kubewarden --version 3.2.0 kubewarden-controller kubewarden/kubewarden-controller
```

## Import cluster in Rancher



