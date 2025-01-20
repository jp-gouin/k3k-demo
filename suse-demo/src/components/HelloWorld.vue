<script>
export default {
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      nodeName: 'Loading...',
      podName: 'Loading...',
    };
  },
  mounted() {
    fetch('/env')
      .then(response => response.json())
      .then(data => {
        this.nodeName = data.nodeName;
        this.podName = data.podName;
      })
      .catch(error => {
        console.error('Error fetching environment data:', error);
      });
  },
};
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      I'm running in : 
      <p>Node Name: <p class="chips">{{ nodeName }}</p></p>
      <p>Pod Name: <p class="chips">{{ podName }}</p></p>
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
.chips {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border-radius: 20px;
  background-color: #333;
  color: #eee;
  font-family: sans-serif;
}
</style>
