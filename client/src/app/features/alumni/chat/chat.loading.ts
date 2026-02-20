import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-chat-loading',
  template: `
    <div class="flex h-[calc(100vh-64px)] animate-pulse">
      <!-- Sidebar Skeleton -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-100">
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Main Chat Skeleton -->
      <div class="flex-1 flex flex-col bg-gray-50">
        <div class="h-16 bg-white border-b border-gray-200"></div>
        <div class="flex-1 p-6 space-y-6">
          <div class="flex justify-start">
            <div class="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          </div>
          <div class="flex justify-end">
            <div class="h-12 bg-gray-200 rounded-lg w-1/4"></div>
          </div>
          <div class="flex justify-start">
            <div class="h-12 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
        </div>
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  `,
})
export class ChatLoadingComponent {}
