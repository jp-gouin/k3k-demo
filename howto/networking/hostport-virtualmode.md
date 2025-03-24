# Deploy a Pod with hostport

1. in a `virtual` mode cluster run `k apply -f hostport.yaml`
2. expected result: 
   1. The pod is scheduled
   2. The pod is not accessible outside the host cluster
      1. Inside the host cluster the nginx pod is accessible on the pod IP of an agent using the host port

Example, 

My virtual cluster in `virtual` mode has an agent pod `k3k-vc-rancher3-agent-5dc44b845f-9pdg2` with `10.42.188.194` as pod IP.

Running 

```
kubectl port-forward -n k3k-vc-rancher3 pods/k3k-vc-rancher3-agent-5dc44b845f-9pdg2 11111:8080
```

On the host cluster, I can now run 
```
curl localhost:11111
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```