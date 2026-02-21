import { useState } from 'react'
import './style.css'
import { Button } from '@repo/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@repo/ui/Card'
import { FileText, MessageCircle, FileUp, Calculator, BookOpen, Mic, Menu, X, AlertCircle, CheckCircle } from 'lucide-react'

// ===== VIEW COMPONENTS =====

// VIEW 1: The Lawyer (Chat Dashboard)
function LawyerView() {
  const [messages, setMessages] = useState([
    { role: 'user', text: 'What is the speed limit in residential areas in the Philippines?' },
    { role: 'ai', text: 'The speed limit in residential areas is 20 kph according to RA 4136. Here are relevant citations.' },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', text: input }])
      setInput('')
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: 'Based on Philippine traffic law, [RA 4136], the answer is...' }])
      }, 800)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">The Lawyer</h2>
          <p className="text-muted-foreground">Ask legal traffic questions</p>
        </div>
        <Button variant="destructive" className="gap-2">
          <AlertCircle className="w-4 h-4" />
          Crisis Mode
        </Button>
      </div>

      <Card className="h-96 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto space-y-4 pt-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <p className="text-sm">{msg.text}</p>
                {msg.role === 'ai' && (
                  <div className="mt-3 pt-3 border-t border-muted space-y-2">
                    <p className="text-xs font-semibold">Citations:</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-accent/20 px-2 py-1 rounded">[RA 4136]</span>
                      <span className="text-xs bg-accent/20 px-2 py-1 rounded">[JAO 2014-01]</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t gap-2">
          <input
            type="text"
            placeholder="Ask a legal question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-2 rounded border border-input bg-background"
          />
          <Button onClick={handleSend} size="sm">Send</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// VIEW 2: Ticket Decoder
function TicketDecoderView() {
  const [result, setResult] = useState(null)
  const [file, setFile] = useState(null)

  const handleUpload = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      // Simulate analysis
      setTimeout(() => {
        setResult({
          violation: 'Expired Drivers License',
          fine: '₱500 - ₱1,000',
          settlement: 'Visit LTO office with valid ID and payment',
        })
      }, 1000)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Ticket Decoder</h2>
        <p className="text-muted-foreground">Upload a photo of your LTO apprehension ticket</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition">
            <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Drag and drop your ticket image</p>
            <p className="text-sm text-muted-foreground mb-4">or click to select</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              id="ticket-upload"
            />
            <label htmlFor="ticket-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-muted rounded">
              <p className="text-sm font-medium">Selected: {file.name}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Violation Found</p>
                  <p className="text-sm text-muted-foreground">{result.violation}</p>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded">
                <p className="text-sm font-medium text-primary">Fine Amount</p>
                <p className="text-lg font-bold text-primary">{result.fine}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Settlement Instructions</p>
                <p className="text-sm text-muted-foreground">{result.settlement}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// VIEW 3: Registration Cost Estimator
function RegistrationEstimatorView() {
  const [vehicleType, setVehicleType] = useState('sedan')
  const [year, setYear] = useState(2022)
  const [monthsLate, setMonthsLate] = useState(0)
  const [result, setResult] = useState(null)

  const calculate = () => {
    setResult({
      basic: 1500,
      penalty: monthsLate * 100,
      emission: 300,
      tpl: 800,
      total: 1500 + (monthsLate * 100) + 300 + 800,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Registration Cost Estimator</h2>
        <p className="text-muted-foreground">Calculate your registration renewal cost</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="text-sm font-medium">Vehicle Type</label>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full mt-1 px-3 py-2 border border-input rounded bg-background">
              <option>Motorcycle</option>
              <option>Sedan</option>
              <option>SUV</option>
              <option>PUV</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Model Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full mt-1 px-3 py-2 border border-input rounded bg-background" />
          </div>

          <div>
            <label className="text-sm font-medium">Months Late for Registration</label>
            <input type="number" value={monthsLate} onChange={(e) => setMonthsLate(Number(e.target.value))} className="w-full mt-1 px-3 py-2 border border-input rounded bg-background" />
          </div>

          <Button onClick={calculate} className="w-full">Calculate Estimate</Button>

          {result && (
            <div className="mt-6 space-y-3 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span>Basic Renewal</span>
                <span className="font-medium">₱{result.basic}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Penalty</span>
                <span className="font-medium">₱{result.penalty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Emission Test</span>
                <span className="font-medium">₱{result.emission}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TPL Insurance</span>
                <span className="font-medium">₱{result.tpl}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total Estimate</span>
                <span className="text-primary">₱{result.total}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// VIEW 4: License Getter Wizard
function LicenseWizardView() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)
  const [checklist, setChecklist] = useState(null)

  const options = [
    { id: 'student', label: 'Student Permit' },
    { id: 'new', label: 'New License (Pro/Non-Pro)' },
    { id: 'renewal', label: 'Renewal (Check 10-Year Eligibility)' },
  ]

  const requirements = {
    student: ['Birth Certificate', '1x1 ID Photo', 'Parent Consent Form', 'School Enrollment Certificate'],
    new: ['Birth Certificate', 'Police Clearance', 'Medical Certificate', '4x4 ID Photos', 'Passport/Driver License Application'],
    renewal: ['Current Driver License', 'Medical Certificate', '4x4 ID Photos', 'Payment Receipt'],
  }

  const handleSelect = (id) => {
    setSelected(id)
    setChecklist(requirements[id].map(req => ({ req, checked: false })))
    setStep(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">License Getter Wizard</h2>
        <p className="text-muted-foreground">Step-by-step guide to getting or renewing your license</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 0 && (
            <div className="space-y-3">
              <p className="font-medium mb-4">Select your license type:</p>
              {options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className="w-full p-4 border border-input rounded-lg text-left hover:bg-muted transition"
                >
                  <p className="font-medium">{opt.label}</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && checklist && (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setStep(0)} className="w-full">← Back</Button>
              <h3 className="font-bold text-lg">Requirements Checklist</h3>
              <div className="space-y-2">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const updated = [...checklist]
                        updated[i].checked = e.target.checked
                        setChecklist(updated)
                      }}
                      className="rounded"
                    />
                    <span className={item.checked ? 'line-through text-muted-foreground' : ''}>{item.req}</span>
                  </label>
                ))}
              </div>
              <Button className="w-full mt-4">Proceed to LTO</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// VIEW 5: Exam Reviewer
function ExamReviewerView() {
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const question = {
    text: 'When approaching a yellow traffic light, what should a driver do?',
    options: [
      { id: 'a', text: 'Speed up to cross before it turns red' },
      { id: 'b', text: 'Slow down and prepare to stop' },
      { id: 'c', text: 'Maintain speed and proceed' },
    ],
    correct: 'b',
    explanation: 'According to RA 4136, drivers must slow down and prepare to stop when approaching a yellow light.',
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Exam Reviewer (TDC/CDE)</h2>
        <p className="text-muted-foreground">Practice LTO exam questions</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="font-medium">{question.text}</p>
          </div>

          <div className="space-y-2">
            {question.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelected(opt.id)
                  setAnswered(true)
                }}
                disabled={answered}
                className={`w-full text-left p-3 border rounded-lg transition ${
                  answered ? (
                    opt.id === question.correct ? 'border-green-500 bg-green-50' :
                    opt.id === selected ? 'border-red-500 bg-red-50' :
                    'border-border'
                  ) : 'border-input hover:bg-muted'
                } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="font-medium">{opt.id.toUpperCase()}:</span> {opt.text}
              </button>
            ))}
          </div>

          {answered && (
            <div className={`p-3 rounded-lg ${selected === question.correct ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              <p className="font-medium">{selected === question.correct ? '✓ Correct!' : '✗ Incorrect'}</p>
            </div>
          )}

          {answered && (
            <Button variant="secondary" className="w-full gap-2" onClick={() => setShowExplanation(!showExplanation)}>
              <Mic className="w-4 h-4" />
              {showExplanation ? 'Hide' : 'Explain'} Answer (Uses 1 Credit)
            </Button>
          )}

          {showExplanation && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// VIEW 6: Argument Script Generator
function ArgumentGeneratorView() {
  const [situation, setSituation] = useState('')
  const [generated, setGenerated] = useState(null)

  const generate = () => {
    if (situation.trim()) {
      setGenerated({
        script: `Sir/Ma'am, according to AO AHS-2008-015 and RA 4136 Section 42, I believe there may be a misunderstanding regarding this citation. [Explain your situation politely]. I am willing to comply with all traffic regulations and would appreciate your guidance on the proper procedure.`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Argument Script Generator</h2>
        <p className="text-muted-foreground">Generate a polite response to use with traffic enforcers</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="text-sm font-medium">Describe your situation:</label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="E.g., I was stopped at a traffic light and the officer said I made an illegal turn..."
              className="w-full mt-2 px-3 py-2 border border-input rounded bg-background h-32 resize-none"
            />
          </div>

          <Button onClick={generate} className="w-full">Generate Polite Script</Button>

          {generated && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium text-accent">Generated Script:</p>
              <p className="text-sm leading-relaxed">{generated.script}</p>
              <p className="text-xs text-muted-foreground mt-3">✓ Uses citation format per Philippine traffic law</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ===== MAIN APP COMPONENT =====

export function App() {
  const [activeView, setActiveView] = useState('lawyer')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dailyQuotaUsed] = useState(15)
  const [dailyQuotaTotal] = useState(20)

  const views = [
    { id: 'lawyer', label: 'The Lawyer', icon: MessageCircle, component: LawyerView },
    { id: 'decoder', label: 'Ticket Decoder', icon: FileUp, component: TicketDecoderView },
    { id: 'estimator', label: 'Cost Estimator', icon: Calculator, component: RegistrationEstimatorView },
    { id: 'wizard', label: 'License Wizard', icon: BookOpen, component: LicenseWizardView },
    { id: 'reviewer', label: 'Exam Reviewer', icon: FileText, component: ExamReviewerView },
    { id: 'generator', label: 'Script Generator', icon: Mic, component: ArgumentGeneratorView },
  ]

  const ActiveComponent = views.find(v => v.id === activeView)?.component || LawyerView

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">Maneho.ai</h1>
            <p className="text-xs text-muted-foreground mt-1">Legal & Driving Companion</p>
          </div>

          {/* Daily Quota */}
          <div className="p-4 mx-3 mt-4 bg-primary/10 rounded-lg">
            <p className="text-xs font-semibold text-primary">Daily AI Quota</p>
            <div className="mt-2 bg-background rounded overflow-hidden">
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary rounded" style={{ width: `${(dailyQuotaUsed / dailyQuotaTotal) * 100}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dailyQuotaUsed}/{dailyQuotaTotal} queries used</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-4">
            {views.map(view => {
              const Icon = view.icon
              return (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveView(view.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                    activeView === view.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-left">{view.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full text-xs">Sign Out</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-4 flex items-center justify-between md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <h1 className="text-lg font-bold text-foreground hidden md:block flex-1">
            {views.find(v => v.id === activeView)?.label}
          </h1>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right text-xs">
              <p className="font-medium">{dailyQuotaTotal - dailyQuotaUsed} queries left</p>
              <p className="text-muted-foreground">Today</p>
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="p-4 md:p-6 overflow-y-auto">
          <ActiveComponent />
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
