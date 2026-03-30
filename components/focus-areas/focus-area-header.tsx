import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FocusAreaHeader() {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Focus Areas</h1>
        <p className="text-muted-foreground">Track your progress and complete activities in your focus areas</p>
      </div>
      <div className="flex items-center space-x-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="stress">Stress Management</SelectItem>
            <SelectItem value="sleep">Sleep Quality</SelectItem>
            <SelectItem value="anxiety">Anxiety</SelectItem>
            <SelectItem value="depression">Depression</SelectItem>
            <SelectItem value="social">Social Connection</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-teal-600 hover:bg-teal-700">Add Focus Area</Button>
      </div>
    </div>
  )
}
