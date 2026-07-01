describe('Greeting Logic', () => {
  const getGreeting = (hour: number) => {
    if (hour >= 5 && hour < 12) {
      return 'Good morning'
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon'
    } else {
      return 'Good evening'
    }
  }

  describe('Morning greetings (5 AM - 11:59 AM)', () => {
    test('returns "Good morning" for 5 AM', () => {
      expect(getGreeting(5)).toBe('Good morning')
    })

    test('returns "Good morning" for 6 AM', () => {
      expect(getGreeting(6)).toBe('Good morning')
    })

    test('returns "Good morning" for 8 AM', () => {
      expect(getGreeting(8)).toBe('Good morning')
    })

    test('returns "Good morning" for 11 AM', () => {
      expect(getGreeting(11)).toBe('Good morning')
    })

    test('returns "Good morning" for all morning hours', () => {
      const morningHours = [5, 6, 7, 8, 9, 10, 11]
      morningHours.forEach(hour => {
        expect(getGreeting(hour)).toBe('Good morning')
      })
    })
  })

  describe('Afternoon greetings (12 PM - 5:59 PM)', () => {
    test('returns "Good afternoon" for 12 PM', () => {
      expect(getGreeting(12)).toBe('Good afternoon')
    })

    test('returns "Good afternoon" for 1 PM', () => {
      expect(getGreeting(13)).toBe('Good afternoon')
    })

    test('returns "Good afternoon" for 3 PM', () => {
      expect(getGreeting(15)).toBe('Good afternoon')
    })

    test('returns "Good afternoon" for 5 PM', () => {
      expect(getGreeting(17)).toBe('Good afternoon')
    })

    test('returns "Good afternoon" for all afternoon hours', () => {
      const afternoonHours = [12, 13, 14, 15, 16, 17]
      afternoonHours.forEach(hour => {
        expect(getGreeting(hour)).toBe('Good afternoon')
      })
    })
  })

  describe('Evening greetings (6 PM - 11:59 PM and 12 AM - 4:59 AM)', () => {
    test('returns "Good evening" for 6 PM', () => {
      expect(getGreeting(18)).toBe('Good evening')
    })

    test('returns "Good evening" for 8 PM', () => {
      expect(getGreeting(20)).toBe('Good evening')
    })

    test('returns "Good evening" for 11 PM', () => {
      expect(getGreeting(23)).toBe('Good evening')
    })

    test('returns "Good evening" for midnight', () => {
      expect(getGreeting(0)).toBe('Good evening')
    })

    test('returns "Good evening" for 2 AM', () => {
      expect(getGreeting(2)).toBe('Good evening')
    })

    test('returns "Good evening" for 4 AM', () => {
      expect(getGreeting(4)).toBe('Good evening')
    })

    test('returns "Good evening" for all evening hours', () => {
      const eveningHours = [18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]
      eveningHours.forEach(hour => {
        expect(getGreeting(hour)).toBe('Good evening')
      })
    })
  })

  describe('Boundary conditions', () => {
    test('handles exact boundary between evening and morning', () => {
      expect(getGreeting(4)).toBe('Good evening')
      expect(getGreeting(5)).toBe('Good morning')
    })

    test('handles exact boundary between morning and afternoon', () => {
      expect(getGreeting(11)).toBe('Good morning')
      expect(getGreeting(12)).toBe('Good afternoon')
    })

    test('handles exact boundary between afternoon and evening', () => {
      expect(getGreeting(17)).toBe('Good afternoon')
      expect(getGreeting(18)).toBe('Good evening')
    })
  })
})
