---
title: "DANI: Fast Diffusion Aware Network Inference with Preserving Topological Structure Property"
authors:
  - Maryam Ramezani
  - Aryan Ahadinia
  - Erfan Farhadi
  - Hamid R. Rabiee
venue: Scientific Reports
year: 2024
date: 2024-12-28
type: journal
doi: 10.1038/s41598-024-82286-x
arxiv: "2310.01696"
url: "https://www.nature.com/articles/s41598-024-82286-x"
code: "https://github.com/AryanAhadinia/DANI"
selected: true
areas: [complex-networks]
tags: [Network Inference, Information Diffusion, Graph Mining, Social Networks]
abstract: >-
  Numerous algorithms have been proposed to infer the underlying structure of social
  networks via observed information propagation. Previously proposed algorithms
  concentrate on inferring accurate links and neglect preserving the essential topological
  properties of the underlying social networks. We propose a novel method called DANI to
  infer the underlying network while preserving its structural properties. DANI is
  constructed using the Markov transition matrix derived from the analysis of time series
  cascades and the observation of node-node similarity in cascade behaviour from a
  structural perspective. The presented method has linear time complexity, and its
  distributed version in the MapReduce framework is scalable. Experiments on real and
  synthetic networks show that DANI has higher accuracy and lower run time than well-known
  network inference methods, while preserving modular structure, degree distribution,
  connected components, density and clustering coefficients.
---

DANI infers a social network from the cascades that travel over it. Where earlier inference methods optimise only for recovering individual links, DANI also preserves the properties that make the recovered graph usable for anything else: its modular structure, its degree distribution, its density and its clustering coefficients.

The method combines two signals: a Markov transition matrix built from the timing of cascades, and a structural similarity between nodes computed from how they behave across cascades. Its complexity is linear in the number of nodes and cascades and quadratic in the average cascade length, and the MapReduce version scales to larger graphs.

The implementation is [available on GitHub](https://github.com/AryanAhadinia/DANI).
