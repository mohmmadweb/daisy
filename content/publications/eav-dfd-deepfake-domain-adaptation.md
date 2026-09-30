---
title: Teacher-Student Structure for Domain Adaptation in Ensemble Audio-Visual Video Deepfake Detection
authors:
  - Elham Abolhasani
  - Maryam Ramezani
  - Hamid R. Rabiee
venue: arXiv preprint
venue_short: arXiv
year: 2026
date: 2026-06-13
type: preprint
arxiv: "2606.15117"
selected: true
areas: [trustworthy-ai]
tags: [Deepfake Detection, Domain Adaptation, Multi-modal Learning, Audio-Visual]
abstract: >-
  The rapid advancement of generative AI models is leading to more realistic deepfake
  media, encompassing the manipulation of audio, video, or both. Numerous studies have
  yielded promising intra-domain results; however, these models frequently exhibit
  decreased efficacy when faced with data from dissimilar domains. We propose EAV-DFD, a
  generalised deep ensemble audio-visual model combined with a domain adaptation mechanism
  using a teacher-student framework, to improve performance across unseen domains. Using
  FakeAVCeleb as the primary domain and DFDC, Deepfake_TIMIT and PolyGlotFake as unseen
  domains, the framework improves AUC by 4.09%, 17.94% and 0.5% respectively while
  training the student model on only a small portion of the target data, and can interpret
  which modality has been manipulated.
---

Deepfake detectors that score well on the dataset they were trained on tend to collapse on media from anywhere else. EAV-DFD combines an ensemble over audio, visual and cross-modal signals with a teacher-student domain adaptation step, so a small sample from a new domain is enough to recover much of the lost accuracy.

The ensemble structure has a second benefit: the model can report which modality carries the manipulation, not just that something is fake.
