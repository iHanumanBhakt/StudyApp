// Synthesizes futuristic sci-fi sound effects in real-time using Web Audio API
export const playSpaceSound = (type) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    if (type === 'unlock') {
      // Sci-fi synth power-up sound (rising pitch)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(180, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
      
      osc2.frequency.setValueAtTime(90, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    } else if (type === 'launch') {
      // Synthesize a highly soothing, lush celestial swell chord (ambient space wind)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const osc4 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const gain3 = ctx.createGain();
      const gain4 = ctx.createGain();
      
      // Beautiful soothing C major 9 chord structure
      // C4 (261.63Hz) - Warm root base
      // G4 (392.00Hz) - Perfect fifth
      // D5 (587.33Hz) - Ninth
      // B5 (987.77Hz) - Shimmering major seventh
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(261.63, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(262.5, ctx.currentTime + 2.5); // Drifting pitch
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(392.00, ctx.currentTime);
      
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(587.33, ctx.currentTime);
      
      osc4.type = 'sine'; // Sine waves are pure and soothing (no harsh harmonics)
      osc4.frequency.setValueAtTime(987.77, ctx.currentTime);
      
      // Soothing slow swell attack (0.6s) and very long release
      const duration = 2.6;
      
      gain1.gain.setValueAtTime(0.001, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.6); // Base swell
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      gain2.gain.setValueAtTime(0.001, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.7);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      gain3.gain.setValueAtTime(0.001, ctx.currentTime);
      gain3.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.8);
      gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      gain4.gain.setValueAtTime(0.001, ctx.currentTime);
      gain4.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.9); // Shimmer swell
      gain4.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);
      osc4.connect(gain4);
      
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);
      gain3.connect(ctx.destination);
      gain4.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc3.start();
      osc4.start();
      
      osc1.stop(ctx.currentTime + duration + 0.2);
      osc2.stop(ctx.currentTime + duration + 0.2);
      osc3.stop(ctx.currentTime + duration + 0.2);
      osc4.stop(ctx.currentTime + duration + 0.2);
    } else if (type === 'denied') {
      // Cybernetic alert/error buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.setValueAtTime(85, ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      // Clean futuristic UI feedback click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }
  } catch (e) {
    console.warn("Web Audio API blocked or not supported by browser.", e);
  }
};
