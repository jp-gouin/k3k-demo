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

## Deploy the shared mode cluster
1. add name
2. click shared

## Connect to the cluster

1. Copy Kubeconfig
2. Create `mycluster1-kubeconfig.yaml` file
3. Paste kubeconfig
4. export KUBECONFIG=/home/jpgouin/sandbox/virtual_cluster/demo/mycluster1-kubeconfig.yaml
5. `k get nodes`


## Deploy App
Deploy Nginx
```
k apply -f  https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/baremetal/deploy.yaml
```

View App content
`cat suse-demo/kubernetes/app.yaml`

Deploy App
```
k apply -f suse-demo/kubernetes/app.yaml
```

Get nodeport and access the app
```
k get svc -A
http://suseapp.3.92.22.246.sslip.io:30250/
```

## Install kubewarden-crds

List CRDs in host -> no kubewarden crds
```
k get crd -w
```

Install Kubewarden on the virtual cluster
```
helm install --wait -n kubewarden --create-namespace kubewarden-crds kubewarden/kubewarden-crds
helm install --wait -n kubewarden kubewarden-controller kubewarden/kubewarden-controller
```

List CRDs -> kubewarden crds in k3k cluster
```
k get crd
```

## Deploy another cluster

1. add name
2. click virtual
3. change network settings
   • clusterCIDR: 10.52.0.0/16  
   • serviceCIDR: 10.53.0.0/16

## Showcase CRD isolation

```
export KUBECONFIG=/home/jpgouin/sandbox/virtual_cluster/demo/mycluster2-kubeconfig.yaml
helm install --wait -n kubewarden --version 1.11.0 --create-namespace kubewarden-crds kubewarden/kubewarden-crds
helm install --wait -n kubewarden --version 3.2.0 kubewarden-controller kubewarden/kubewarden-controller
```

## Import cluster in Rancher



