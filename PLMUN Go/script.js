document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // NAVBAR GLASS EFFECT (all pages)
  // ==========================================
  const topNav = document.querySelector('.top-nav');
  if (topNav) {
    const handleScroll = () => {
      topNav.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  // ==========================================
  // MOBILE NAV TOGGLE (all pages)
  // ==========================================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active'); /* Triggers the X animation */
    navLinks.classList.toggle('active');  /* Opens the menu */
});

  // ==========================================
  // OFFICE DIRECTORY (accordion + search)
  // ==========================================
  const buildingCards = document.querySelectorAll('.building-card');
  const dirSearch = document.getElementById('directory-search');
  const dirClear = document.getElementById('directory-clear');
  const dirEmpty = document.getElementById('directory-empty');

  if (buildingCards.length > 0) {

    const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

    // Text that belongs to an element itself (not its children)
    const ownText = (el) =>
      Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join(' ');

    const setCardOpen = (card, open) => {
      card.classList.toggle('active', open);
      const header = card.querySelector('.building-header');
      if (header) header.setAttribute('aria-expanded', String(open));
    };

    // ---- Setup: counts, closed floors, click handlers ----
    buildingCards.forEach((card) => {
      const header = card.querySelector('.building-header');
      if (!header) return;

      // Count places (only items with no nested list)
      let count = 0;
      card.querySelectorAll('.building-content li').forEach((li) => {
        if (!li.querySelector('li')) count++;
      });

      const badge = document.createElement('span');
      badge.className = 'building-count';
      badge.textContent = count + ' places';
      header.insertBefore(badge, header.querySelector('.building-icon'));

      header.setAttribute('aria-expanded', 'false');
      card.querySelectorAll('.building-content details').forEach((d) => {
        d.open = false;
      });

      header.addEventListener('click', () => {
        const isOpen = card.classList.contains('active');
        const searching = dirSearch && norm(dirSearch.value) !== '';

        if (searching) {
          // While searching, each card toggles on its own
          setCardOpen(card, !isOpen);
          return;
        }

        buildingCards.forEach((c) => setCardOpen(c, false));

        if (!isOpen) {
          setCardOpen(card, true);
        }
      });
    });

    // ---- Search ----
    const filterItem = (li, q, parentMatched) => {
      const nested = li.querySelector(':scope > ul');
      const selfMatch = norm(ownText(li)).includes(q);

      if (!nested) {
        const show = selfMatch || parentMatched;
        li.classList.toggle('dir-hidden', !show);
        return show;
      }

      let any = false;
      nested.querySelectorAll(':scope > li').forEach((child) => {
        if (filterItem(child, q, parentMatched || selfMatch)) any = true;
      });

      const show = selfMatch || any;
      li.classList.toggle('dir-hidden', !show);
      return show;
    };

    const resetDirectory = () => {
      document.querySelectorAll('.dir-hidden').forEach((el) => {
        el.classList.remove('dir-hidden');
      });
      buildingCards.forEach((card) => {
        setCardOpen(card, false);
        card.querySelectorAll('.building-content details').forEach((d) => {
          d.open = false;
        });
      });
      if (dirEmpty) dirEmpty.hidden = true;
    };

    const runDirectorySearch = () => {
      const q = norm(dirSearch.value);

      if (dirClear) dirClear.hidden = q === '';

      if (q === '') {
        resetDirectory();
        return;
      }

      let matchedBuildings = 0;

      buildingCards.forEach((card) => {
        const header = card.querySelector('.building-header');
        const buildingMatched = header ? norm(ownText(header)).includes(q) : false;
        let cardHasMatch = false;

        card.querySelectorAll('.building-content details').forEach((floor) => {
          const summary = floor.querySelector('summary');
          const floorMatched =
            buildingMatched || (summary ? norm(summary.textContent).includes(q) : false);

          let any = false;
          floor.querySelectorAll(':scope > ul > li').forEach((li) => {
            if (filterItem(li, q, floorMatched)) any = true;
          });

          floor.classList.toggle('dir-hidden', !any);
          if (any) {
            floor.open = true;
            cardHasMatch = true;
          }
        });

        card.classList.toggle('dir-hidden', !cardHasMatch);
        setCardOpen(card, cardHasMatch);
        if (cardHasMatch) matchedBuildings++;
      });

      if (dirEmpty) dirEmpty.hidden = matchedBuildings > 0;
    };

    if (dirSearch) {
      dirSearch.addEventListener('input', runDirectorySearch);
      dirSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dirSearch.value = '';
          runDirectorySearch();
        }
      });
    }

    if (dirClear) {
      dirClear.addEventListener('click', () => {
        dirSearch.value = '';
        runDirectorySearch();
        dirSearch.focus();
      });
    }
  }

  // ==========================================
  // CONTACT FORM
  // ==========================================
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form && formStatus) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const response = await fetch('https://formspree.io/f/mwpygpbd', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      formStatus.style.display = 'block';
      if (response.ok) {
        form.reset();
      } else {
        formStatus.style.color = 'red';
        formStatus.textContent = 'Oops! Something went wrong. Try again.';
      }
    });
  }

});

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('singleSlider');
  if (!container) return;

  const slides = container.querySelectorAll('.single-slide');
  const dots = container.querySelectorAll('.dot');
  const totalRealDots = dots.length; // 5 dots
  let currentIndex = 0;
  let slideInterval;

  function nextSlide() {
    // Remove all classes first
    slides.forEach((slide) => {
      slide.classList.remove('active', 'prev');
    });

    // Mark current as previous (sliding out left)
    const prevIndex = currentIndex;
    currentIndex = (currentIndex + 1) % slides.length;

    slides[prevIndex].classList.add('prev');
    slides[currentIndex].classList.add('active');

    // Update dots (using modulo so duplicate slide maps back to dot 0 cleanly)
    const activeDotIndex = currentIndex % totalRealDots;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeDotIndex);
    });
  }

  // Auto-slide every 2 seconds (adjust here if you want it faster/slower)
  function startSlider() {
    slideInterval = setInterval(nextSlide, 2000);
  }

  // Pause on hover, resume on leave
  container.addEventListener('mouseenter', () => clearInterval(slideInterval));
  container.addEventListener('mouseleave', () => startSlider());

  // Initialize
  startSlider();
});

document.addEventListener('DOMContentLoaded', function() {
    const mapPins = document.querySelectorAll('.map-pin');
    const mapPopup = document.getElementById('mapPopup');
    const popupImg = document.getElementById('popupImg');
    const popupTitle = document.getElementById('popupTitle');
    const popupDesc = document.getElementById('popupDesc');

    if (mapPins.length > 0 && mapPopup) {
        
        // Unified function to populate and position the popup
        // Unified function to populate and position the popup
        function openPopup(pin) {
            const title = pin.getAttribute('data-title');
            const image = pin.getAttribute('data-image');
            const desc = pin.getAttribute('data-desc') || '';

            if (popupTitle) popupTitle.textContent = title;
            if (popupImg) popupImg.src = image;
            if (popupDesc) popupDesc.textContent = desc;

            // Set the baseline vertical position
            mapPopup.style.top = (pin.offsetTop - 120) + 'px';

            // Check if this is a building that should open on the left
            if (title === "Del Pilar Building" || title === "Rizal Building") {
                mapPopup.classList.add('popup-left');
                // Anchor exact left coordinate to the pin so CSS can pull it backward
                mapPopup.style.left = pin.offsetLeft + 'px'; 
            } else {
                mapPopup.classList.remove('popup-left');
                // Standard right-side positioning with a 20px gap
                mapPopup.style.left = (pin.offsetLeft + 20) + 'px';
            }

            mapPopup.style.display = 'block';
        }

        mapPins.forEach(pin => {
            // -- PC Hover Behavior --
            pin.addEventListener('mouseenter', () => {
                openPopup(pin);
            });

            pin.addEventListener('mouseleave', () => {
                mapPopup.style.display = 'none';
            });

            // -- Mobile Tap Behavior --
            pin.addEventListener('click', (event) => {
                event.stopPropagation(); // Stops the tap from bubbling up to the document
                
                // If this pin's popup is already showing, ignore the click (prevent toggle conflict)
                if (mapPopup.style.display === 'block' && popupTitle.textContent === pin.getAttribute('data-title')) {
                    return; 
                }
                
                openPopup(pin);
            });
        });

        // Close the popup if a mobile user taps anywhere else on the screen
        document.addEventListener('click', () => {
            if (mapPopup.style.display === 'block') {
                mapPopup.style.display = 'none';
            }
        });
    }

    // ==========================================
  // ADMISSIONS FAQ ACCORDION (Auto-Close)
  // ==========================================
  const accordions = document.querySelectorAll('.accordion-item');

  accordions.forEach(accordion => {
    // The 'toggle' event fires natively whenever a <details> tag opens or closes
    accordion.addEventListener('toggle', function() {
      if (this.open) {
        // If this one just opened, loop through the rest and close them
        accordions.forEach(otherAccordion => {
          if (otherAccordion !== this && otherAccordion.open) {
            otherAccordion.open = false;
          }
        });
      }
    });
  });
});

// ==========================================
// AI ASSISTANT READ ALOUD (TOGGLE: READ -> PAUSE -> PLAY)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const readAloudBtn = document.getElementById('read-aloud-btn');
  const aiResponse = document.getElementById('ai-response');
  const clearBtn = document.getElementById('clear-btn');

  const resetBtnUI = () => {
    if (readAloudBtn) {
      readAloudBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Read aloud';
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    resetBtnUI();
  };

  if (readAloudBtn) {
    readAloudBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) return;

      const synth = window.speechSynthesis;

      // 1. If currently PAUSED -> Resume speech & show Pause button
      if (synth.speaking && synth.paused) {
        synth.resume();
        readAloudBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        return;
      }

      // 2. If currently SPEAKING -> Pause speech & show Play button
      if (synth.speaking && !synth.paused) {
        synth.pause();
        readAloudBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
        return;
      }

      // 3. Otherwise (IDLE) -> Start new speech
      const rawText = aiResponse ? aiResponse.textContent.trim() : '';
      if (!rawText) return;

      // Strip emojis and decorative symbols
      const cleanText = rawText
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, '')
        .replace(/[^\w\s.,?!'()-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      synth.cancel(); // Stop any active queue

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Reset button UI when audio finishes or errors out
      utterance.onend = resetBtnUI;
      utterance.onerror = resetBtnUI;

      synth.speak(utterance);
      readAloudBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      stopSpeaking();
      if (aiResponse) aiResponse.textContent = 'How can I help you navigate PLMun today?';
    });
  }
});