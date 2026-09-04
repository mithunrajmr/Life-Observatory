# Design Research References & Foundations

Life Observatory's product and visualization decisions are grounded in scientific literature in graphical perception, human-computer interaction, and personal informatics.

## 1. Graphical Perception & Common Scale
- **Reference**: Cleveland, W. S., & McGill, R. (1984). *Graphical Perception: Theory, Experimentation, and Application to the Development of Graphical Methods.* [Link](https://faculty.washington.edu/aragon/classes/hcde511/s12/readings/cleveland84.pdf)
- **Application**: Human visual cognition decodes quantitative and trajectory comparisons with highest accuracy when positions are aligned along a common scale. Therefore, Life Horizon places all life domains on an aligned temporal axis, rather than using radar charts or distorted radial geometry.

## 2. Longitudinal Personal Reflection
- **Reference**: Choe, E. K., et al. (2017). *Understanding Self-Reflection: How People Reflect on Their Personal Data.* Microsoft Research. [Link](https://www.microsoft.com/en-us/research/publication/understanding-self-reflection-people-reflect/)
- **Application**: Individuals struggle to reconstruct gradual transitions from day-to-day memory. Longitudinal alignment enables users to observe cumulative micro-progress that is otherwise obscured by recency bias.

## 3. Minimizing Tracking Burden
- **Reference**: Epstein, D. A., et al. (2020). *Examining the Adoption and Abandonment of Personal Informatics Systems.* [Link](https://pubmed.ncbi.nlm.nih.gov/33656451/)
- **Application**: High manual tracking overhead causes rapid user churn. Life Observatory requires only natural-language brief reflections (or passive calendar sync) without demanding tedious rating forms or questionnaires.

## 4. Animated Transitions in Data Graphics
- **Reference**: Heer, J., & Robertson, G. G. (2007). *Animated Transitions in Statistical Data Graphics.* IEEE InfoVis / Microsoft Research. [Link](https://www.microsoft.com/en-us/research/publication/animated-transitions-in-statistical-data-graphics/)
- **Application**: The "What Changed?" feature utilizes animated interpolation between time windows to visually communicate the trajectory shift rather than abruptly replacing charts.

## 5. Accessibility & Contrast
- **Reference**: W3C Web Content Accessibility Guidelines (WCAG) 2.2 AA. [Link](https://www.w3.org/TR/WCAG22/)
- **Application**: Color is never the sole carrier of semantic state. Trajectories, trend arrows, badges, and contrast-checked text ensure full accessibility across vision and motor abilities.
